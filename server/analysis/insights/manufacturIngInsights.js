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
  function getFirstNumericCol(df) {
        for (const col of df.columns) {
            const vals = df[col].values;
            if (vals.some(v => !isNaN(parseFloat(v)))) return col;
        }
        return null;
    }

    function getNumericCols(df) {
        return df.columns.filter(col =>
            df[col].values.some(v => !isNaN(parseFloat(v)))
        );
    }

    function getFirstDateCol(df, threshold = 0.3) {
        for (const col of df.columns) {
            const vals = df[col].values;
            const validCount = vals.filter(v => !isNaN(Date.parse(v))).length;
            if ((validCount / vals.length) >= threshold) {
                return col;
            }
        }
        return null;
    }
    const numericCols = getNumericCols(df);
    const prodCol = fuzzyMatch(df, ["produce", "unit", "output", "volume", "production", 'unitproduced', 'unitsproduced', 'product_id']) || getFirstNumericCol(df);
    const costCol = fuzzyMatch(df, ["cost", "expense", "spend", 'productioncost', 'repair_cost']) || numericCols[1] || numericCols[0] || null;
    const qualityCol = fuzzyMatch(df, ["defect", "quality", "reject", "scrap", 'defectrate', 'defect_id']) || numericCols[2] || numericCols[1] || numericCols[0] || null;
    const machineCol = fuzzyMatch(df, ["machine", "downtime", "uptime", "maintenance", 'machineuptime', 'machinedowntime', 'machinemaintenance']) || numericCols[numericCols.length -1] || null;
    const leadTimeCol = fuzzyMatch(df, ["leadtime", "delivery", "supply"]);
    const materialCol = fuzzyMatch(df, ["material", "raw", "input"]) || numericCols[3] || numericCols[2] || numericCols[1] || numericCols[0] || null;;
    const energyCol = fuzzyMatch(df, ["energy", "power", "electricity"]);
    const laborCol = fuzzyMatch(df, ["labor", "workforce", "staff", "manpower"]);
    const dateCol = fuzzyMatch(df, ["date", "period", "time", "timestamp", 'month', 'defect_date']) || getFirstDateCol(df);

    const prodVals = prodCol ? cleanNum(df[prodCol].values) : [];

    // ─── Basic Production Stats ───
    if (prodCol) {
        insights.kpis.total_production = safeSum(prodVals);
        insights.kpis.avg_production = safeMean(prodVals);
        insights.kpis.max_production = safeMax(prodVals);
        insights.kpis.median_production = safeMedian(prodVals);
        insights.hypothesis.push(`✅ Production column detected: '${prodCol}'.`);
    } else {
        insights.hypothesis.push("⚠️ No production column found. Skipping production KPIs.");
    }

    // ─── Production Efficiency ───
    if (prodCol && prodVals.length > 0) {
        if (costCol) {
            const costs = cleanNum(df[costCol].values);
            insights.efficiency.cost_per_unit = (safeSum(costs) / safeSum(prodVals)).toFixed(2);
        }
        if (materialCol) {
            const inputs = cleanNum(df[materialCol].values);
            insights.efficiency.material_efficiency = (safeSum(prodVals) / safeSum(inputs)).toFixed(2);
        }
        if (energyCol) {
            const energy = cleanNum(df[energyCol].values);
            insights.energy.energy_per_unit = (safeSum(energy) / safeSum(prodVals)).toFixed(2);
        }
        insights.hypothesis.push("📊 Production efficiency metrics calculated.");
    }

    // ─── Quality Control ───
    if (qualityCol && prodVals.length > 0) {
        const defects = cleanNum(df[qualityCol].values);
        insights.quality.defect_rate = (safeSum(defects) / safeSum(prodVals)).toFixed(4);
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
    if (laborCol && prodVals.length > 0) {
        const laborVals = cleanNum(df[laborCol].values);
        insights.workforce.productivity = (safeSum(prodVals) / safeSum(laborVals)).toFixed(2);
        insights.hypothesis.push("👷 Workforce productivity calculated.");
    }

    // ─── Trend & Forecast ───
    if (dateCol && prodCol && df.shape[0] >= 3) {
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

    if (catCol && prodCol) {
        try {
            const grouped = groupByAndAggregate(df, catCol, prodCol, "mean");
            const sorted = grouped.sortValues(prodCol, { ascending: false });
            const rows = sorted.values.map(row =>
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

    // ─── Additional Defect Analysis ───
    if (qualityCol) {
        try {
            insights.quality.total_defects = df.shape[0];

            if (costCol) {
                const repairCosts = cleanNum(df[costCol].values);
                insights.quality.avg_repair_cost = safeMean(repairCosts);
                insights.quality.total_repair_cost = safeSum(repairCosts);
            }

            const breakdownCols = ["defect_type", "defect_location", "severity", "inspection_method"];
            for (const col of breakdownCols) {
                if (df.columns.includes(col)) {
                    const grouped = groupByAndAggregate(df, col, costCol, "mean");
                    const sorted = grouped.sortValues(costCol, { ascending: false });
                    const rows = sorted.values.map((row) =>
                        Object.fromEntries(sorted.columns.map((c, i) => [c, row[i]]))
                    );
                    insights.quality[`avg_repair_cost_by_${col}`] = rows;
                    insights.hypothesis.push(`🔍 Repair cost breakdown by '${col}' analyzed.`);
                }
            }

            insights.hypothesis.push("🛠 Defect dataset recognized. Added defect count and cost-based insights.");
        } catch (e) {
            insights.hypothesis.push(`⚠️ Additional defect insight generation failed: ${e.message}`);
        }
    }

    return insights;
}

module.exports = { getManufacturingInsights };
