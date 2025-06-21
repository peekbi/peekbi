const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const {
    safeSum, safeMean, safeMax, safeMedian
} = require("../utils/statsUtils");
const {
    groupByAndAggregate, trendAnalysis, correlation
} = require("../helper");

// ────────────── HELPERS ──────────────
function cleanNum(values) {
    return values
        .map(v => (typeof v === "string" ? parseFloat(v) : v))
        .filter(v => typeof v === "number" && !isNaN(v));
}

function fuzzyMatch(df, keywords, type = "number") {
    return df.columns.find(col => {
        const norm = col.toLowerCase().replace(/[\s_]/g, "");
        if (!keywords.some(k => norm.includes(k))) return false;
        const isNumeric = df[col].values.some(v => !isNaN(parseFloat(v)));
        return type === "number" ? isNumeric : true;
    }) || null;
}

function guessCategorical(df, skipCols = []) {
    return df.columns.filter(col => {
        if (skipCols.includes(col)) return false;
        const unique = new Set(df[col].values.map(v => v?.toString()?.trim())).size;
        return unique > 1 && unique <= 50 && typeof df[col].values[0] === "string";
    });
}

function deriveCategorical(df) {
    for (const col of df.columns) {
        const unique = new Set(df[col].values.map(v => v?.toString()?.trim()));
        const ratio = unique.size / df.shape[0];
        if (ratio < 0.5 && unique.size > 1 && unique.size <= 50) {
            return col;
        }
    }
    return null;
}

// ────────────── MAIN FUNCTION ──────────────
function getManufacturingInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        hypothesis: []
    };

    // 🔍 Auto-detect columns
    const prodCol = fuzzyMatch(df, ["produce", "unit", "output", "volume", "production"]);
    const costCol = fuzzyMatch(df, ["cost", "expense", "spend"]);
    const qualityCol = fuzzyMatch(df, ["quality", "defect", "error", "reject"]);
    const machineCol = fuzzyMatch(df, ["machine", "equipment", "uptime", "downtime"]);
    const dateCol = fuzzyMatch(df, ["date", "period", "time", "timestamp"]);

    if (!prodCol) {
        insights.hypothesis.push("⚠️ Missing production column — core insights not available.");
        return insights;
    }

    const prodVals = cleanNum(df[prodCol].values);
    insights.kpis.total_production = safeSum(prodVals);
    insights.kpis.avg_production = safeMean(prodVals);
    insights.kpis.median_production = safeMedian(prodVals);
    insights.kpis.max_production = safeMax(prodVals);
    insights.hypothesis.push(`✅ Production detected in '${prodCol}'.`);

    // 📉 Cost Metrics
    if (costCol) {
        const costVals = cleanNum(df[costCol].values);
        insights.kpis.total_cost = safeSum(costVals);
        insights.kpis.avg_cost = safeMean(costVals);
        insights.kpis.max_cost = safeMax(costVals);

        if (insights.kpis.total_production > 0) {
            insights.kpis.cost_per_unit = (insights.kpis.total_cost / insights.kpis.total_production).toFixed(2);
            insights.hypothesis.push("💰 Cost per unit calculated.");
        }

        if (costVals.length >= 3) {
            const corr = correlation(df, prodCol, costCol);
            insights.kpis.prod_cost_corr = corr.toFixed(2);
            insights.hypothesis.push(`📈 Correlation (production vs cost): ${corr.toFixed(2)}`);
        }
    }

    // ⚙️ Machine Metrics
    if (machineCol) {
        const vals = cleanNum(df[machineCol].values);
        insights.kpis.avg_machine_metric = safeMean(vals);
        if (safeSum(vals) > 0) {
            insights.kpis.prod_per_machine_metric = (insights.kpis.total_production / safeSum(vals)).toFixed(2);
            insights.hypothesis.push("⚙️ Production per machine-metric computed.");
        }
    }

    // 🧪 Quality
    if (qualityCol) {
        const vals = cleanNum(df[qualityCol].values);
        insights.kpis.avg_quality_metric = safeMean(vals);
        insights.hypothesis.push(`🛠 Quality data from '${qualityCol}'.`);
    }

    // 🧩 Categorical Breakdown
    // 🧩 Categorical Breakdown — FORCE fallback if missing
    let categoricalCols = guessCategorical(df, [prodCol, costCol, qualityCol, machineCol, dateCol]);
    let catCol = categoricalCols.length > 0 ? categoricalCols[0] : deriveCategorical(df);

    // Fallback: use any string-type column if no good match
    if (!catCol) {
        catCol = df.columns.find(col => typeof df[col].values[0] === "string");
        if (catCol) insights.hypothesis.push(`⚠️ Fallback to first string column: '${catCol}'`);
    }

    if (catCol && df.columns.includes(catCol)) {
        try {
            const grouped = groupByAndAggregate(df, catCol, prodCol, "mean");

            if (grouped && grouped.shape[0] > 0) {
                const sorted = grouped.sortValues(prodCol, { ascending: false });

                // 🔧 Properly convert to array of rows (not object of arrays!)
                const json = sorted.values.map((row, idx) => {
                    const obj = {};
                    sorted.columns.forEach((col, i) => {
                        obj[col] = row[i];
                    });
                    return obj;
                });

                insights.totals[`production_by_${catCol}`] = json;
                insights.highPerformers[`top_${catCol}`] = json.slice(0, 3);
                insights.lowPerformers[`bottom_${catCol}`] = json.slice(-3);
                insights.hypothesis.push(`🏷 Breakdown by '${catCol}' successful.`);
            } else {
                insights.totals[`production_by_${catCol}`] = [];
                insights.highPerformers[`top_${catCol}`] = [];
                insights.lowPerformers[`bottom_${catCol}`] = [];
                insights.hypothesis.push(`⚠️ Grouping returned no data for '${catCol}'.`);
            }
        } catch (err) {
            insights.hypothesis.push(`⚠️ Error during breakdown by '${catCol}': ${err.message}`);
        }
    } else {
        insights.hypothesis.push("⚠️ No valid column found for breakdown. `totals`, `highPerformers`, `lowPerformers` skipped.");
    }

    // 📅 Trend + Forecast
    if (dateCol && df.shape[0] >= 3) {
        try {
            const trends = trendAnalysis(df, dateCol, prodCol);
            insights.trends = trends;
            insights.hypothesis.push(`📅 Trends detected over '${dateCol}'.`);

            const y = trends.map(r => r.avg).filter(v => v !== null);
            if (y.length >= 3) {
                const reg = new mlr([...Array(y.length).keys()], y);
                const next = reg.predict(y.length);
                insights.kpis.next_period_forecast = next.toFixed(2);
                insights.hypothesis.push("🔮 Forecast for next period calculated.");
            }
        } catch (err) {
            insights.hypothesis.push(`⚠️ Trend/forecast error: ${err.message}`);
        }
    }

    // ✅ Ensure non-empty response
    if (Object.keys(insights.highPerformers).length === 0) {
        insights.hypothesis.push("⚠️ No high/low performer insights generated.");
    }

    return insights;
}

module.exports = { getManufacturingInsights };
