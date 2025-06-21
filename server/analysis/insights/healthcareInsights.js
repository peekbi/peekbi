const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");
const { groupByAndAggregate, trendAnalysis } = require("../helper");

// 🧼 Clean number array
function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => parseFloat(v)).filter(v => !isNaN(v))
        : [];
}

// 🔍 Fuzzy match helper
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

// ✅ First numeric column fallback
function getFirstNumericCol(df) {
    for (const col of df.columns) {
        const vals = df[col].values;
        if (vals.some(v => !isNaN(parseFloat(v)))) return col;
    }
    return null;
}

// 🔧 Safe .toJSON conversion to row objects
function toRowJSON(df) {
    return df.values.map((row, idx) => {
        const obj = {};
        df.columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

// 🔁 Dynamic breakdown by small-cardinality strings
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

                const rows = toRowJSON(sorted);
                const key = col.toLowerCase().replace(/\s+/g, '_');

                insights.highPerformers[`top_${key}`] = rows.slice(0, 3);
                insights.lowPerformers[`bottom_${key}`] = rows.slice(-3);
                insights.totals[`cases_by_${key}`] = rows;
                insights.hypothesis.push(`📌 Insight breakdown by '${col}' with ${uniqueCount} unique values.`);
            } catch (err) {
                insights.hypothesis.push(`⚠️ Failed breakdown on '${col}': ${err.message}`);
            }
        }
    });
}

// 🧠 Core Insight Generator
function getHealthcareInsights(df) {
    const insights = {
        kpis: {
            total_cases: 0,
            avg_cases: 0,
            median_cases: 0,
            max_cases: 0,
        },
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    // 🔍 Auto-detect columns
    const valueCol = fuzzyMatch(df, ["value", "cases", "charges", "amount", "count", "number", "insulin", "glucose", "bmi"], "number") || getFirstNumericCol(df);
    const categoryCol = fuzzyMatch(df, ["injury", "disease", "outcome", "condition", "group", "result", "category"]);
    const regionCol = fuzzyMatch(df, ["region", "state", "zone", "location", "area"]);
    const yearCol = fuzzyMatch(df, ["year", "date", "period", "timestamp"]);
    const occupationCol = fuzzyMatch(df, ["occupation", "job", "role"]);
    const industryCol = fuzzyMatch(df, ["industry", "sector"]);

    if (!valueCol) {
        insights.hypothesis.push("⚠️ No numeric value column detected.");
        return insights;
    }

    insights.hypothesis.push(`✅ Value column used: '${valueCol}'`);
    const valArr = cleanNum(df[valueCol].values);

    // 🎯 KPIs
    insights.kpis.total_cases = safeSum(valArr);
    insights.kpis.avg_cases = safeMean(valArr);
    insights.kpis.median_cases = safeMedian(valArr);
    insights.kpis.max_cases = safeMax(valArr);
    insights.hypothesis.push("📊 KPIs computed.");

    // 🧩 Breakdown Helper
    function breakdown(col, label) {
        try {
            const grouped = groupByAndAggregate(df, col, valueCol, "sum");
            const sorted = grouped.sortValues(valueCol, { ascending: false });
            const rows = toRowJSON(sorted);

            insights.highPerformers[`top_${label}`] = rows.slice(0, 3);
            insights.lowPerformers[`bottom_${label}`] = rows.slice(-3);
            insights.totals[`cases_by_${label}`] = rows;

            insights.hypothesis.push(`🧩 Breakdown on '${col}' as '${label}' complete.`);
        } catch (err) {
            insights.hypothesis.push(`⚠️ Breakdown error for '${col}': ${err.message}`);
        }
    }

    if (regionCol) breakdown(regionCol, "regions");
    if (occupationCol) breakdown(occupationCol, "occupations");
    if (industryCol) breakdown(industryCol, "industries");
    if (categoryCol) breakdown(categoryCol, "conditions");

    // 🔁 Auto breakdown
    dynamicBreakdown(df, valueCol, insights);

    // 📈 Trends
    if (yearCol) {
        try {
            const trend = trendAnalysis(df, yearCol, valueCol);
            insights.trends = trend;

            const values = trend.map(row => row.avg);
            const growth = values
                .map((v, i) => i === 0 ? null : ((v - values[i - 1]) / values[i - 1]) * 100)
                .filter(v => v !== null && !isNaN(v));

            if (growth.length > 0) {
                insights.kpis.avg_growth_rate = safeMean(growth).toFixed(2) + "%";
                insights.hypothesis.push("📈 Yearly growth trends analyzed.");
            }
        } catch (err) {
            insights.hypothesis.push(`⚠️ Trend analysis error: ${err.message}`);
        }
    }

    // 🔮 Forecast
    if (yearCol && df.shape[0] >= 3) {
        try {
            const subset = df.loc({ columns: [yearCol, valueCol] }).dropNa();
            const years = cleanNum(subset[yearCol].values.map(y => parseInt(y)));
            const values = cleanNum(subset[valueCol].values);

            if (years.length === values.length && years.length >= 3) {
                const reg = new mlr(years, values);
                const next = Math.max(...years) + 1;
                const pred = reg.predict(next);
                insights.kpis.predicted_next_year_cases = pred.toFixed(2);
                insights.hypothesis.push(`🔮 Forecast: ~${pred.toFixed(2)} cases in ${next}`);
            }
        } catch {
            insights.hypothesis.push("⚠️ Forecast skipped due to invalid regression data.");
        }
    }

    // 📉 Feature correlation
    const allNumCols = df.columns.filter(c => cleanNum(df[c].values).length > 0 && c !== valueCol);
    const topCorr = allNumCols.map(col => {
        const x = cleanNum(df[col].values);
        const y = valArr;
        const paired = x.map((v, i) => [v, y[i]]).filter(([a, b]) => !isNaN(a) && !isNaN(b));
        if (paired.length < 3) return null;

        const xVals = paired.map(p => p[0]);
        const yVals = paired.map(p => p[1]);

        const avgX = safeMean(xVals), avgY = safeMean(yVals);
        const cov = xVals.map((v, i) => (v - avgX) * (yVals[i] - avgY)).reduce((a, b) => a + b, 0) / xVals.length;
        const stdX = Math.sqrt(xVals.map(v => (v - avgX) ** 2).reduce((a, b) => a + b, 0) / xVals.length);
        const stdY = Math.sqrt(yVals.map(v => (v - avgY) ** 2).reduce((a, b) => a + b, 0) / yVals.length);
        const corr = cov / (stdX * stdY);
        return { col, corr };
    }).filter(Boolean).sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));

    if (topCorr[0] && Math.abs(topCorr[0].corr) > 0.4) {
        insights.hypothesis.push(`📌 Feature '${topCorr[0].col}' shows strong correlation (${topCorr[0].corr.toFixed(2)}) with '${valueCol}'.`);
    }

    if (insights.hypothesis.length === 0) {
        insights.hypothesis.push("⚠️ No strong signals found. Add outcome, region, or date columns.");
    }

    return insights;
}

module.exports = { getHealthcareInsights };
