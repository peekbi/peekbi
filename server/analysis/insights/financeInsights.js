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
        forecast: {},
        segments: {},
        variance: {},
        hypothesis: []
    };

    const revenueCol = fuzzyMatch(df, ["revenue", "sales", "amount", "income", "checking", "transaction"]);
    const expenseCol = fuzzyMatch(df, ["expense", "cost", "spend", "debit", "withdrawal"]);
    const dateCol = fuzzyMatch(df, ["date", "timestamp", "period", "time"]);
    const metricCol = fuzzyMatch(df, ["metric", "type", "category", "label"], "string");
    const customerCol = fuzzyMatch(df, ["customer", "client", "user"], "string");

    if (!revenueCol) {
        insights.hypothesis.push("⚠️ Revenue column not found.");
        return insights;
    }

    const revenueVals = cleanNum(df[revenueCol].values);
    const expenseVals = expenseCol ? cleanNum(df[expenseCol].values) : [];

    // ────── KPIs ──────
    insights.kpis.total_revenue = safeSum(revenueVals);
    insights.kpis.avg_revenue = safeMean(revenueVals);
    insights.kpis.median_revenue = safeMedian(revenueVals);
    insights.kpis.max_revenue = safeMax(revenueVals);

    if (expenseVals.length) {
        insights.kpis.total_expenses = safeSum(expenseVals);
        insights.kpis.avg_expenses = safeMean(expenseVals);
        const netProfit = insights.kpis.total_revenue - insights.kpis.total_expenses;
        insights.kpis.net_profit = netProfit.toFixed(2);
        insights.kpis.net_margin = ((netProfit / insights.kpis.total_revenue) * 100).toFixed(2) + "%";
        insights.hypothesis.push("📊 Calculated profitability ratios.");
    } else {
        insights.hypothesis.push("💡 Only revenue data available; no expense analysis.");
    }

    // ────── Trend Analysis ──────
    if (dateCol) {
        try {
            const trends = trendAnalysis(df, dateCol, revenueCol, expenseCol);
            if (Array.isArray(trends) && trends.length > 0) {
                insights.trends = trends;
                insights.hypothesis.push("📈 Revenue vs Expense trend analysis complete.");
            } else {
                insights.hypothesis.push("⚠️ Trend analysis returned no insights.");
            }
        } catch {
            insights.hypothesis.push("⚠️ Trend analysis failed.");
        }
    }

    // ────── Forecast: Cash Flow ──────
    if (dateCol && expenseCol) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol, expenseCol] }).dropNa().sortValues(dateCol);
            const net = dfCopy[revenueCol].values.map((r, i) => parseFloat(r) - parseFloat(dfCopy[expenseCol].values[i]));
            const x = [...Array(net.length).keys()];
            if (x.length >= 3) {
                const reg = new mlr(x, net);
                const forecast = reg.predict(net.length);
                insights.forecast = {
                    method: "linear_regression",
                    next_cashflow: forecast.toFixed(2)
                };
                insights.hypothesis.push("🔮 Cash flow forecast generated.");
            } else {
                insights.hypothesis.push("⚠️ Not enough data for cash flow forecast.");
            }
        } catch {
            insights.hypothesis.push("⚠️ Cash flow forecast failed.");
        }
    }

    // ────── Monthly Variance ──────
    if (dateCol) {
        try {
            const dfMonth = df.loc({ columns: [dateCol, revenueCol] });
            const months = dfMonth[dateCol].values.map(d => new Date(d).toISOString().slice(0, 7));
            dfMonth.addColumn("Month", months, { inplace: true });
            const monthly = groupByAndAggregate(dfMonth, "Month", revenueCol, "sum");
            insights.variance.monthly_revenue = monthly.toJSON();
            insights.hypothesis.push("📅 Monthly revenue variance analyzed.");
        } catch {
            insights.hypothesis.push("⚠️ Monthly variance analysis failed.");
        }
    }

    // ────── Customer Segmentation ──────
    if (customerCol) {
        const numericCols = df.columns.filter(c =>
            c !== customerCol &&
            df[c].values.every(v => typeof v === "number" && !isNaN(v))
        );
        if (numericCols.length >= 2) {
            insights.segments.available_features = numericCols;
            insights.hypothesis.push("👥 Customer segmentation features detected.");
        } else {
            insights.hypothesis.push("⚠️ Not enough numeric fields for segmentation.");
        }
    }

    // ────── Group Performance ──────
    let catColList = guessCategorical(df, [revenueCol, expenseCol, dateCol, metricCol]);
    let catCol = catColList.length ? catColList[0] : deriveCategorical(df);

    if (catCol && revenueCol) {
        try {
            const grouped = groupByAndAggregate(df, catCol, revenueCol, "mean");
            const sorted = grouped.sortValues(revenueCol, { ascending: false });
            const json = sorted.values.map(row => {
                const obj = {};
                sorted.columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });

            insights.totals[`revenue_by_${catCol}`] = json;
            insights.highPerformers[`top_${catCol}`] = json.slice(0, 3);
            insights.lowPerformers[`bottom_${catCol}`] = json.slice(-3);
            insights.hypothesis.push(`🏷 Revenue performance grouped by '${catCol}'.`);
        } catch {
            insights.hypothesis.push(`⚠️ Grouping by '${catCol}' failed.`);
        }
    }

    // ────── Risk, Credit, Investment Placeholders ──────
    insights.hypothesis.push("⚠️ Risk exposure requires liabilities/debt columns.");
    insights.hypothesis.push("⚠️ Credit default modeling needs labeled outcomes & payment history.");
    insights.hypothesis.push("📊 Investment performance analysis requires investment/return fields.");

    return insights;
}

module.exports = { getFinanceInsights };
