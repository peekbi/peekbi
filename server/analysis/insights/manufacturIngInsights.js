const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");
const { groupByAndAggregate, trendAnalysis } = require("../helper");

// 🔍 Fuzzy column matching
function fuzzyMatch(df, keywords, type = "string") {
    const cols = df.columns;
    const norm = cols.map(c => c.toLowerCase().replace(/\s|_/g, ''));
    for (let idx = 0; idx < cols.length; idx++) {
        for (const kw of keywords) {
            if (norm[idx].includes(kw.toLowerCase())) {
                const series = df[cols[idx]];
                if (type === "number" && series.values.every(v => isNaN(parseFloat(v)))) continue;
                return cols[idx];
            }
        }
    }
    return null;
}

// Clean numeric values
function cleanNum(vals) {
    return Array.isArray(vals) ?
        vals.map(v => parseFloat(v)).filter(v => !isNaN(v)) : [];
}

// Get first numeric column as fallback
function getFirstNumericCol(df) {
    for (const col of df.columns) {
        if (cleanNum(df[col].values).length > 0) return col;
    }
    return null;
}

// Dynamic breakdown for categorical columns
function dynamicBreakdown(df, valueCol, insights) {
    df.columns.forEach(col => {
        if (col === valueCol) return;
        if (df[col].dtypes !== "object") return;
        const unique = [...new Set(df[col].values)];
        if (unique.length > 1 && unique.length <= 50) {
            try {
                const grp = groupByAndAggregate(df, col, valueCol, "sum").sortValues(valueCol, { ascending: false });
                insights.highPerformers[`top_${col}`] = grp.head(3).toJSON();
                insights.lowPerformers[`bottom_${col}`] = grp.tail(3).toJSON();
                insights.totals[`by_${col}`] = grp.toJSON();
                insights.hypothesis.push(`📌 Breakdown by '${col}' added.`);
            } catch (e) {
                insights.hypothesis.push(`⚠️ Breakdown by '${col}' failed: ${e.message}`);
            }
        }
    });
}

// 🏭 Manufacturing Insights
function getManufacturingInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        hypothesis: [],
    };

    const prodCol = fuzzyMatch(df, ["production", "volume", "units", "output"], "number") || getFirstNumericCol(df);
    const qualityCol = fuzzyMatch(df, ["quality", "defect", "error", "reject"], "number");
    const supplyCol = fuzzyMatch(df, ["supply", "delivery", "leadtime", "inventory"], "number");
    const equipCol = fuzzyMatch(df, ["equipment", "machine", "uptime", "downtime"], "number");
    const dateCol = fuzzyMatch(df, ["date", "period", "time", "timestamp"]);
    const categoryCol = fuzzyMatch(df, ["line", "shift", "product", "department", "plant"]);

    if (!prodCol) {
        insights.hypothesis.push("⚠️ No production volume column detected.");
    } else {
        insights.hypothesis.push(`✅ Production column: '${prodCol}'`);
        const values = cleanNum(df[prodCol].values);
        insights.kpis.total_production = safeSum(values);
        insights.kpis.avg_production = safeMean(values);
        insights.kpis.max_production = safeMax(values);
        insights.kpis.median_production = safeMedian(values);
    }

    // Quality KPI
    if (qualityCol) {
        const vals = cleanNum(df[qualityCol].values);
        insights.kpis.avg_quality_metric = safeMean(vals);
        insights.kpis.max_quality_metric = safeMax(vals);
        insights.hypothesis.push(`📏 Quality KPI from '${qualityCol}' computed.`);
    }

    // Supply Efficiency
    if (supplyCol) {
        const vals = cleanNum(df[supplyCol].values);
        insights.kpis.avg_supply = safeMean(vals);
        insights.hypothesis.push(`🚚 Supply efficiency from '${supplyCol}' computed.`);
    }

    // Equipment Performance
    if (equipCol) {
        const vals = cleanNum(df[equipCol].values);
        insights.kpis.avg_equipment = safeMean(vals);
        insights.hypothesis.push(`⚙️ Equipment performance from '${equipCol}' computed.`);
    }

    // Dynamic breakdown
    if (prodCol) dynamicBreakdown(df, prodCol, insights);

    // Time trend & forecasting
    if (dateCol && prodCol && df.shape[0] >= 3) {
        const trend = trendAnalysis(df, dateCol, prodCol);
        insights.trends = trend;
        insights.hypothesis.push("📈 Trend analysis on production done.");

        const values = trend.map(r => r.avg);
        const growth = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1]) growth.push((values[i] - values[i - 1]) / values[i - 1] * 100);
        }
        if (growth.length) {
            insights.kpis.avg_growth_rate = safeMean(growth).toFixed(2) + "%";
            insights.hypothesis.push("📈 Production growth rate calculated.");
        }

        // Forecast
        const subset = df.loc({ columns: [dateCol, prodCol] }).dropNa();
        const years = subset[dateCol].values.map((_, i) => i);
        const vals = cleanNum(subset[prodCol].values);

        if (vals.length >= 3) {
            try {
                const reg = new mlr(years, vals);
                const pred = reg.predict(vals.length);
                insights.kpis.predicted_next_period_production = pred.toFixed(2);
                insights.hypothesis.push("🔮 Forecasted next period production.");
            } catch (e) {
                insights.hypothesis.push("⚠️ Forecast failed: " + e.message);
            }
        }
    }

    if (insights.hypothesis.length === 0) {
        insights.hypothesis.push("⚠️ No insights could be generated. Add production, date, or category columns.");
    }

    return insights;
}

module.exports = { getManufacturingInsights };
