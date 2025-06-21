const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMedian, safeMax } = require("../utils/statsUtils");
const { trendAnalysis, groupByAndAggregate } = require("../helper");

// ────────────── HELPER FUNCTIONS ──────────────
function cleanNum(values) {
    return values
        .map(v => (typeof v === "string" ? parseFloat(v) : v))
        .filter(v => typeof v === "number" && !isNaN(v));
}

function fuzzyMatch(df, keywords, type = "number") {
    return df.columns.find(col => {
        const norm = col.toLowerCase().replace(/[\s_]/g, "");
        const isNumeric = df[col].values.some(v => !isNaN(parseFloat(v)));
        return keywords.some(k => norm.includes(k)) && (type === "number" ? isNumeric : true);
    }) || null;
}

function guessCategorical(df, skipCols = []) {
    return df.columns.filter(col => {
        if (skipCols.includes(col)) return false;
        const values = df[col].values.map(v => v?.toString()?.trim());
        const unique = new Set(values).size;
        return unique > 1 && unique <= 50 && typeof df[col].values[0] === "string";
    });
}

function deriveCategorical(df) {
    for (const col of df.columns) {
        const values = df[col].values.map(v => v?.toString()?.trim());
        const unique = new Set(values);
        const ratio = unique.size / df.shape[0];
        if (ratio < 0.5 && unique.size > 1 && unique.size <= 50) {
            return col;
        }
    }
    return null;
}

// ────────────── MAIN FUNCTION ──────────────
function getFinanceInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        hypothesis: []
    };

    const revenueCol = fuzzyMatch(df, ["revenue", "sales", "amount", "income", "checking", "transaction"]);
    const expenseCol = fuzzyMatch(df, ["expense", "cost", "spend", "debit", "withdrawal"]);
    const dateCol = fuzzyMatch(df, ["date", "timestamp", "period", "time"]);
    const metricCol = fuzzyMatch(df, ["metric", "type", "category", "label"], "string");

    if (!revenueCol) {
        insights.hypothesis.push("⚠️ Revenue column not found.");
        return insights;
    }

    const revenueVals = cleanNum(df[revenueCol].values);
    const expenseVals = expenseCol ? cleanNum(df[expenseCol].values) : [];

    insights.kpis.total_revenue = safeSum(revenueVals);
    insights.kpis.avg_revenue = safeMean(revenueVals);
    insights.kpis.median_revenue = safeMedian(revenueVals);
    insights.kpis.max_revenue = safeMax(revenueVals);

    if (expenseVals.length) {
        insights.kpis.total_expenses = safeSum(expenseVals);
        insights.kpis.avg_expenses = safeMean(expenseVals);
        insights.kpis.net_profit = (insights.kpis.total_revenue - insights.kpis.total_expenses).toFixed(2);
        insights.hypothesis.push("📊 Analyzed relationship between revenue and expenses.");
    } else {
        insights.hypothesis.push("💡 Only revenue data available; no expense analysis.");
    }

    if (metricCol) {
        try {
            const metrics = df[metricCol].unique().values;
            insights.hypothesis.push(`🧾 Metric values: ${metrics.slice(0, 3).join(", ")}${metrics.length > 3 ? ", ..." : ""}`);
        } catch {
            insights.hypothesis.push("⚠️ Metric column exists but could not extract values.");
        }
    }

    let catColList = guessCategorical(df, [revenueCol, expenseCol, dateCol, metricCol]);
    let catCol = catColList.length ? catColList[0] : deriveCategorical(df);

    if (!catCol) {
        catCol = df.columns.find(col => typeof df[col].values[0] === "string");
        if (catCol) insights.hypothesis.push(`⚠️ Fallback to string column: '${catCol}'`);
    }

    if (catCol && revenueCol) {
        try {
            const grouped = groupByAndAggregate(df, catCol, revenueCol, "mean");

            if (grouped.shape[0] > 0) {
                const sorted = grouped.sortValues(revenueCol, { ascending: false });
                const json = sorted.values.map(row => {
                    const obj = {};
                    sorted.columns.forEach((col, i) => obj[col] = row[i]);
                    return obj;
                });

                insights.totals[`revenue_by_${catCol}`] = json;
                insights.highPerformers[`top_${catCol}`] = json.slice(0, 3);
                insights.lowPerformers[`bottom_${catCol}`] = json.slice(-3);
                insights.hypothesis.push(`🏷 Grouped by '${catCol}' for revenue insights.`);
            }
        } catch (err) {
            insights.hypothesis.push(`⚠️ Grouping failed on '${catCol}': ${err.message}`);
        }
    }

    if (dateCol && revenueVals.length >= 2) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol] }).dropNa();
            const sorted = dfCopy.sortValues(dateCol);
            const revs = cleanNum(sorted[revenueCol].values);
            const growthRates = [];

            for (let i = 1; i < revs.length; i++) {
                const prev = revs[i - 1] || 1;
                const rate = ((revs[i] - prev) / prev) * 100;
                if (isFinite(rate)) growthRates.push(rate);
            }

            if (growthRates.length) {
                insights.kpis.revenue_growth_rate_avg = safeMean(growthRates).toFixed(2) + "%";
                insights.kpis.revenue_growth_rate_median = safeMedian(growthRates).toFixed(2) + "%";
                insights.hypothesis.push("📈 Revenue growth rate calculated.");
            }
        } catch {
            insights.hypothesis.push("⚠️ Revenue growth rate failed.");
        }
    }

    if (dateCol && revenueVals.length >= 3) {
        try {
            const dfTime = df.loc({ columns: [dateCol, revenueCol] }).dropNa();
            const sorted = dfTime.sortValues(dateCol);
            const x = [...Array(sorted.shape[0]).keys()];
            const y = cleanNum(sorted[revenueCol].values);

            if (y.length >= 3) {
                const reg = new mlr(x, y);
                const next = reg.predict(x.length);
                insights.kpis.revenue_forecast_next_period = next.toFixed(2);
                insights.hypothesis.push("🔮 Forecast for next period generated.");
            }
        } catch (err) {
            insights.hypothesis.push(`⚠️ Forecasting error: ${err.message}`);
        }
    }

    if (dateCol && df.shape[0] >= 3) {
        try {
            const trends = trendAnalysis(df, dateCol, revenueCol);
            insights.trends = trends;
            insights.hypothesis.push(`📅 Trend analysis on '${dateCol}' completed.`);
        } catch {
            insights.hypothesis.push("⚠️ Trend analysis failed.");
        }
    }

    if (!Object.keys(insights.highPerformers).length) {
        insights.hypothesis.push("⚠️ No top/bottom performers detected.");
    }

    return insights;
}

module.exports = { getFinanceInsights };
