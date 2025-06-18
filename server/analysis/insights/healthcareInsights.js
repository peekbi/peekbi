const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");
const { groupByAndAggregate, trendAnalysis } = require("../helper");

// 🔍 Match column by fuzzy keyword
function fuzzyMatch(df, keywords, type = "string") {
    const columns = df.columns;
    const normalized = columns.map(c => c.toLowerCase().replace(/\s|_/g, ''));
    for (const key of keywords) {
        const k = key.toLowerCase();
        for (let i = 0; i < normalized.length; i++) {
            const col = columns[i];
            const series = df[col];
            if (normalized[i].includes(k)) {
                if (type === "number" && !series.values.some(v => !isNaN(parseFloat(v)))) continue;
                return col;
            }
        }
    }
    return null;
}

// 🧼 Convert to cleaned number array
function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => parseFloat(v)).filter(v => !isNaN(v))
        : [];
}

// ✅ Get first numeric column
function getFirstNumericCol(df) {
    for (const col of df.columns) {
        const vals = df[col].values;
        if (vals.some(v => !isNaN(parseFloat(v)))) return col;
    }
    return null;
}
// ✅ Dynamic breakdown by all small cardinality string columns
function dynamicBreakdown(df, valueCol, insights) {
    df.columns.forEach(col => {
        if (col === valueCol) return;

        const series = df[col];
        if (!series || series.dtypes !== "object") return;

        const uniqueCount = new Set(series.values).size;
        if (uniqueCount < 50 && uniqueCount > 1) {
            try {
                const grouped = groupByAndAggregate(df, col, valueCol, "sum");
                const sorted = grouped.sortValues(valueCol, { ascending: false });

                const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
                const bottomRows = dfd.toJSON(sorted.tail(3), { format: "row" });
                const allRows = dfd.toJSON(sorted, { format: "row" });

                const key = col.toLowerCase().replace(/\s+/g, '_');
                insights.highPerformers[`top_${key}`] = topRows;
                insights.lowPerformers[`bottom_${key}`] = bottomRows;
                insights.totals[`cases_by_${key}`] = allRows;

                insights.hypothesis.push(`📌 Insight breakdown by '${col}' with ${uniqueCount} unique values.`);
            } catch (err) {
                insights.hypothesis.push(`⚠️ Failed breakdown on '${col}': ${err.message}`);
            }
        }
    });
}

// ✅ Main Insight Function
function getHealthcareInsights(df) {
    const insights = {
        kpis: {
            total_cases: 0,
            avg_cases: 0,
            median_cases: 0,
            max_cases: 0
        },
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    // 🔍 Fuzzy detection of key columns
    const valueCol = fuzzyMatch(df, ["value", "cases", "charges", "amount", "count", "number", "insulin", "glucose", "bmi"], "number") || getFirstNumericCol(df);
    const categoryCol = fuzzyMatch(df, ["injury", "disease", "outcome", "condition", "group", "result", "category"]);
    const regionCol = fuzzyMatch(df, ["region", "state", "zone", "location", "area"]);
    const yearCol = fuzzyMatch(df, ["year", "date", "period", "timestamp"]);
    const occupationCol = fuzzyMatch(df, ["occupation", "job", "role"]);
    const industryCol = fuzzyMatch(df, ["industry", "sector"]);

    // ✅ Fallback notes
    if (!valueCol) insights.hypothesis.push("⚠️ No numeric value column detected.");
    else insights.hypothesis.push(`✅ Value column used: "${valueCol}"`);

    const valArr = cleanNum(df[valueCol]?.values ?? []);

    // 🎯 KPIs
    insights.kpis.total_cases = safeSum(valArr);
    insights.kpis.avg_cases = safeMean(valArr);
    insights.kpis.median_cases = safeMedian(valArr);
    insights.kpis.max_cases = safeMax(valArr);
    if (valArr.length > 0) insights.hypothesis.push("📊 KPIs computed from numeric column.");

    // 🗺️ Region Analysis
    if (regionCol) {
        const grouped = groupByAndAggregate(df, regionCol, valueCol, "sum");
        if (grouped) {
            const sorted = grouped.sortValues(valueCol, { ascending: false });
            const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
            const bottomRows = dfd.toJSON(sorted.tail(3), { format: "row" });
            const allRows = dfd.toJSON(sorted, { format: "row" });

            insights.highPerformers.top_regions = topRows;
            insights.lowPerformers.bottom_regions = bottomRows;
            insights.totals.cases_by_region = allRows;
            insights.hypothesis.push("🌍 Region-level insights added.");
        }
    }

    // 💼 Occupation
    if (occupationCol) {
        const grouped = groupByAndAggregate(df, occupationCol, valueCol, "sum");
        const sorted = grouped.sortValues(valueCol, { ascending: false });
        const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
        const bottomRows = dfd.toJSON(sorted.tail(3), { format: "row" });
        const allRows = dfd.toJSON(sorted, { format: "row" });

        insights.highPerformers.top_occupations = topRows;
        insights.lowPerformers.bottom_occupations = bottomRows;
        insights.totals.cases_by_occupation = allRows;
        insights.hypothesis.push("👔 Occupation-wise breakdown done.");
    }

    // 🏢 Industry
    if (industryCol) {
        const grouped = groupByAndAggregate(df, industryCol, valueCol, "sum");
        const sorted = grouped.sortValues(valueCol, { ascending: false });
        const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
        const allRows = dfd.toJSON(sorted, { format: "row" });

        insights.highPerformers.top_industries = topRows;
        insights.totals.cases_by_industry = allRows;
        insights.hypothesis.push("🏭 Industry-wise analysis complete.");
    }

    // 🧬 Conditions / Outcomes
    if (categoryCol) {
        const grouped = groupByAndAggregate(df, categoryCol, valueCol, "sum");
        const sorted = grouped.sortValues(valueCol, { ascending: false });
        const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
        const bottomRows = dfd.toJSON(sorted.tail(3), { format: "row" });
        const allRows = dfd.toJSON(sorted, { format: "row" });

        insights.highPerformers.top_conditions = topRows;
        insights.lowPerformers.bottom_conditions = bottomRows;
        insights.totals.cases_by_condition = allRows;
        insights.hypothesis.push("🧬 Outcome/category-level insights done.");
    }

    // 📊 Dynamic column breakdowns
    if (valueCol) dynamicBreakdown(df, valueCol, insights);

    // 📈 Trends
    if (yearCol && valueCol) {
        const trend = trendAnalysis(df, yearCol, valueCol);
        insights.trends = trend;

        const values = trend.map(row => row.avg);
        const growthRates = [];
        for (let i = 1; i < values.length; i++) {
            const prev = values[i - 1];
            const now = values[i];
            if (prev && now) {
                const rate = ((now - prev) / prev) * 100;
                if (!isNaN(rate)) growthRates.push(rate);
            }
        }

        if (growthRates.length > 0) {
            insights.kpis.avg_growth_rate = safeMean(growthRates).toFixed(2) + "%";
            insights.hypothesis.push("📈 Time-based growth trends computed.");
        }
    }

    // 🔮 Forecast next year using regression
    if (yearCol && valueCol && df.shape[0] >= 3) {
        try {
            const subset = df.loc({ columns: [yearCol, valueCol] }).dropNa();
            const years = subset[yearCol].values.map(y => parseInt(y)).filter(y => !isNaN(y));
            const values = cleanNum(subset[valueCol].values);

            if (years.length === values.length && years.length >= 3) {
                const reg = new mlr(years, values);
                const next = Math.max(...years) + 1;
                const pred = reg.predict(next);
                insights.kpis.predicted_next_year_cases = pred.toFixed(2);
                insights.hypothesis.push(`🔮 Forecast: ~${pred.toFixed(2)} cases in ${next}`);
            }
        } catch {
            insights.hypothesis.push("⚠️ Forecast skipped due to invalid time data.");
        }
    }

    // 📉 Feature suggestion (experimental)
    const allNumCols = df.columns.filter(c => cleanNum(df[c].values).length > 0 && c !== valueCol);
    if (allNumCols.length > 0) {
        const correlations = allNumCols.map(col => {
            const vals = cleanNum(df[col].values);
            const paired = vals.map((v, i) => [v, valArr[i]]).filter(([a, b]) => !isNaN(a) && !isNaN(b));
            const x = paired.map(p => p[0]);
            const y = paired.map(p => p[1]);
            const n = x.length;
            if (n < 3) return null;

            const avgX = safeMean(x), avgY = safeMean(y);
            const cov = x.map((v, i) => (v - avgX) * (y[i] - avgY)).reduce((a, b) => a + b, 0) / n;
            const stdX = Math.sqrt(x.map(v => (v - avgX) ** 2).reduce((a, b) => a + b, 0) / n);
            const stdY = Math.sqrt(y.map(v => (v - avgY) ** 2).reduce((a, b) => a + b, 0) / n);
            const corr = cov / (stdX * stdY);
            return { col, corr };
        }).filter(Boolean).sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));

        if (correlations[0] && Math.abs(correlations[0].corr) > 0.4) {
            insights.hypothesis.push(`📌 Feature '${correlations[0].col}' shows strong correlation (${correlations[0].corr.toFixed(2)}) with target.`);
        }
    }

    // Final fallback
    if (insights.hypothesis.length === 0) {
        insights.hypothesis.push("⚠️ Not enough pattern in data. Add columns like date, outcome, or region for better insights.");
    }

    return insights;
}

module.exports = { getHealthcareInsights };
