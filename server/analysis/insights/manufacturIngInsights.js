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

function getManufacturingInsights(df) {
    const insights = {
        kpis: {},
        efficiency: {},
        quality: {},
        maintenance: {},
        supplyChain: {},
        energy: {},
        workforce: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        hypothesis: []
    };

    const prodCol = fuzzyMatch(df, ["produce", "unit", "output", "volume", "production"]);
    const costCol = fuzzyMatch(df, ["cost", "expense", "spend"]);
    const qualityCol = fuzzyMatch(df, ["defect", "quality", "reject", "scrap"]);
    const machineCol = fuzzyMatch(df, ["machine", "downtime", "uptime", "maintenance"]);
    const leadTimeCol = fuzzyMatch(df, ["leadtime", "delivery", "supply"]);
    const materialCol = fuzzyMatch(df, ["material", "raw", "input"]);
    const energyCol = fuzzyMatch(df, ["energy", "power", "electricity"]);
    const laborCol = fuzzyMatch(df, ["labor", "workforce", "staff", "manpower"]);
    const dateCol = fuzzyMatch(df, ["date", "period", "time", "timestamp"]);

    // ─── Basic Production Stats ───
    if (prodCol) {
        const prodVals = cleanNum(df[prodCol].values);
        insights.kpis.total_production = safeSum(prodVals);
        insights.kpis.avg_production = safeMean(prodVals);
        insights.kpis.max_production = safeMax(prodVals);
        insights.kpis.median_production = safeMedian(prodVals);
        insights.hypothesis.push(`✅ Production column detected: '${prodCol}'.`);
    } else {
        insights.hypothesis.push("⚠️ No production column found.");
        return insights;
    }

    // ─── Production Efficiency ───
    if (costCol || materialCol || energyCol) {
        if (costCol) {
            const costs = cleanNum(df[costCol].values);
            insights.efficiency.cost_per_unit = (safeSum(costs) / safeSum(cleanNum(df[prodCol].values))).toFixed(2);
        }
        if (materialCol) {
            const inputs = cleanNum(df[materialCol].values);
            insights.efficiency.material_efficiency = (safeSum(df[prodCol].values) / safeSum(inputs)).toFixed(2);
        }
        if (energyCol) {
            const energy = cleanNum(df[energyCol].values);
            insights.energy.energy_per_unit = (safeSum(energy) / safeSum(df[prodCol].values)).toFixed(2);
        }
        insights.hypothesis.push("📊 Production efficiency metrics calculated.");
    }

    // ─── Quality Control ───
    if (qualityCol) {
        const defects = cleanNum(df[qualityCol].values);
        const prod = cleanNum(df[prodCol].values);
        insights.quality.defect_rate = (safeSum(defects) / safeSum(prod)).toFixed(4);
        insights.quality.avg_defects = safeMean(defects);
        insights.hypothesis.push("🧪 Quality control (defect rate) calculated.");
    }

    // ─── Machine Maintenance Trends ───
    if (machineCol && dateCol) {
        try {
            const trends = trendAnalysis(df, dateCol, machineCol);
            insights.maintenance.downtime_trends = trends;
            insights.hypothesis.push("🛠 Machine downtime trends extracted.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Downtime trend extraction failed.");
        }
    }

    // ─── Supply Chain Lead Time ───
    if (leadTimeCol) {
        const leadVals = cleanNum(df[leadTimeCol].values);
        insights.supplyChain.avg_lead_time = safeMean(leadVals);
        insights.supplyChain.max_lead_time = safeMax(leadVals);
        insights.hypothesis.push("🚚 Supply chain lead time calculated.");
    }

    // ─── Workforce Productivity ───
    if (laborCol) {
        const laborVals = cleanNum(df[laborCol].values);
        insights.workforce.productivity = (safeSum(df[prodCol].values) / safeSum(laborVals)).toFixed(2);
        insights.hypothesis.push("👷 Workforce productivity calculated.");
    }

    // ─── Trend & Forecast ───
    if (dateCol && df.shape[0] >= 3) {
        try {
            const trends = trendAnalysis(df, dateCol, prodCol);
            insights.trends = trends;

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

    // ─── Totals by Category ───
    const catCol = df.columns.find(col =>
        typeof df[col].values[0] === "string" &&
        col !== dateCol &&
        ![prodCol, costCol, machineCol, laborCol].includes(col)
    );

    if (catCol) {
        try {
            const grouped = groupByAndAggregate(df, catCol, prodCol, "mean");
            const sorted = grouped.sortValues(prodCol, { ascending: false });
            const rows = sorted.values.map((row) =>
                Object.fromEntries(sorted.columns.map((c, i) => [c, row[i]]))
            );
            insights.totals[`production_by_${catCol}`] = rows;
            insights.highPerformers[`top_${catCol}`] = rows.slice(0, 3);
            insights.lowPerformers[`bottom_${catCol}`] = rows.slice(-3);
            insights.hypothesis.push(`🏷 Category breakdown: '${catCol}' analyzed.`);
        } catch (e) {
            insights.hypothesis.push(`⚠️ Category breakdown failed for '${catCol}'.`);
        }
    }

    return insights;
}

module.exports = { getManufacturingInsights };
