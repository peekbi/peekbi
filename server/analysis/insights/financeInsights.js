const dfd = require("danfojs-node");
const { groupByAndAggregate, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMedian } = require("../utils/statsUtils");
const mlr = require("ml-regression").SimpleLinearRegression; // npm i ml-regression
// ===================== UTILS =========================

function fuzzyMatchColumn(df, keywords) {
    const lowerCols = df.columns.map(c => c.toLowerCase());
    for (const keyword of keywords) {
        for (let i = 0; i < lowerCols.length; i++) {
            if (lowerCols[i].includes(keyword)) return df.columns[i];
        }
    }
    return null;
}

function guessNumericColumn(df, exclude = []) {
    let bestCol = null;
    let maxSum = -Infinity;

    for (const col of df.columns) {
        if (exclude.includes(col)) continue;
        const numericVals = cleanNum(df[col].values);
        const sum = numericVals.reduce((acc, val) => acc + val, 0);

        if (numericVals.length / df[col].values.length > 0.7 && sum > maxSum) {
            bestCol = col;
            maxSum = sum;
        }
    }

    return bestCol;
}

function detectColumn(df, intent, excludeCols = []) {
    const heuristics = {
        revenue: ['revenue', 'sales', 'income', 'budget', 'amount'],
        expenses: ['expense', 'loss', 'cost', 'spending'],
        department: ['department', 'category', 'sector', 'division'],
        date: ['date', 'period', 'timestamp', 'order'],
        metric: ['metric', 'type', 'subject', 'series'],
    };

    const match = fuzzyMatchColumn(df, heuristics[intent] || []);
    if (match) return match;

    if (intent === 'revenue' || intent === 'expenses') {
        return guessNumericColumn(df, excludeCols);
    }

    return null;
}

function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => typeof v === 'string' ? parseFloat(v) : v).filter(v => typeof v === 'number' && !isNaN(v))
        : [];
}

// ===================== KPI BUILDERS =========================

function buildRevenueKPIs(df, revenueCol) {
    const revenueVals = cleanNum(df[revenueCol]?.values ?? []);
    return {
        total_revenue: safeSum(revenueVals),
        avg_revenue: safeMean(revenueVals),
        median_revenue: safeMedian(revenueVals)
    };
}

function buildExpenseKPIs(df, expensesCol) {
    const expensesVals = cleanNum(df[expensesCol]?.values ?? []);
    return {
        total_expenses: safeSum(expensesVals),
        avg_expenses: safeMean(expensesVals),
    };
}

function buildNetProfitKPIs(revenueVals, expensesVals) {
    const totalRevenue = safeSum(revenueVals);
    const totalExpenses = safeSum(expensesVals);
    return {
        net_profit: totalRevenue - totalExpenses
    };
}

// ===================== MAIN =========================

function getFinanceInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    // === Detect columns
    let revenueCol = detectColumn(df, 'revenue');
    let expensesCol = detectColumn(df, 'expenses', [revenueCol]);
    let deptCol = detectColumn(df, 'department');
    let dateCol = detectColumn(df, 'date');
    let metricCol = detectColumn(df, 'metric');

    if (!revenueCol) {
        console.warn("⚠️ Revenue column not detected. Defaulting to best numeric column.");
        revenueCol = guessNumericColumn(df);
    }

    const revenueVals = cleanNum(df[revenueCol]?.values ?? []);
    const expensesVals = expensesCol ? cleanNum(df[expensesCol]?.values ?? []) : [];

    // === KPIs
    Object.assign(insights.kpis, buildRevenueKPIs(df, revenueCol));

    if (expensesCol) {
        Object.assign(insights.kpis, buildExpenseKPIs(df, expensesCol));
        Object.assign(insights.kpis, buildNetProfitKPIs(revenueVals, expensesVals));
    }

    // === Grouped totals
    if (deptCol) {
        const grouped = groupByAndAggregate(df, deptCol, revenueCol, 'sum');
        if (grouped?.shape[0]) {
            grouped.sortValues(revenueCol, { ascending: false, inplace: true });
            insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
            insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
            insights.totals.revenue_by_department = dfd.toJSON(grouped, { format: "row" });
        }
    }

    // === Trends
    if (dateCol && df.shape[0] < 10000) {
        insights.trends = trendAnalysis(df, dateCol, revenueCol);
    }

    // === Hypotheses
    if (expensesCol) {
        insights.hypothesis.push("📊 Analyze if departments with high revenue also incur high expenses.");
    } else {
        insights.hypothesis.push("💡 Only revenue data available; no expense analysis.");
    }

    if (metricCol) {
        try {
            const metrics = df[metricCol].unique().values;
            insights.hypothesis.push(`🧾 Dataset includes metrics: ${metrics.slice(0, 3).join(', ')}${metrics.length > 3 ? ', ...' : ''}`);
        } catch (err) {
            insights.hypothesis.push("⚠️ Unable to extract metric values.");
        }
    } else {
        insights.hypothesis.push("⚠️ No metric column found.");
    }
    // === Growth Rate Over Time
    if (dateCol && revenueCol) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol] }).dropNa();
            const sorted = dfCopy.sortValues(dateCol);
            const dates = sorted[dateCol].values;
            const revenues = cleanNum(sorted[revenueCol].values);

            const growthRates = [];
            for (let i = 1; i < revenues.length; i++) {
                const rate = ((revenues[i] - revenues[i - 1]) / revenues[i - 1]) * 100;
                if (!isNaN(rate) && isFinite(rate)) growthRates.push(rate);
            }

            if (growthRates.length) {
                insights.kpis.revenue_growth_rate_avg = (safeMean(growthRates)).toFixed(2) + '%';
                insights.kpis.revenue_growth_rate_median = (safeMedian(growthRates)).toFixed(2) + '%';
                insights.hypothesis.push("📈 Revenue growth trend calculated from time series.");
            }
        } catch (err) {
            insights.hypothesis.push("⚠️ Revenue growth rate couldn't be computed.");
        }
    }

    // === Revenue vs Budget Comparison
    const budgetCol = detectColumn(df, 'revenue', [revenueCol]); // second numeric column
    if (budgetCol && budgetCol !== revenueCol) {
        const budgetVals = cleanNum(df[budgetCol].values ?? []);
        const revenueTotal = safeSum(revenueVals);
        const budgetTotal = safeSum(budgetVals);
        const diff = revenueTotal - budgetTotal;
        const pctDiff = ((diff / (budgetTotal || 1)) * 100).toFixed(2);

        insights.kpis.total_budget = budgetTotal;
        insights.kpis.budget_variance = diff;
        insights.kpis.budget_vs_actual_pct = pctDiff + '%';

        insights.hypothesis.push(`💰 Revenue is ${pctDiff}% ${diff >= 0 ? 'above' : 'below'} budget.`);
    }

    // === Revenue Forecast (Next Time Period)
    if (dateCol && revenueCol) {
        try {
            const dfTime = df.loc({ columns: [dateCol, revenueCol] }).dropNa();
            const sorted = dfTime.sortValues(dateCol);
            const x = Array.from({ length: sorted.shape[0] }, (_, i) => i); // simple time index
            const y = cleanNum(sorted[revenueCol].values);

            if (x.length >= 3) {
                const reg = new mlr(x, y);
                const nextIndex = x.length;
                const forecast = reg.predict(nextIndex);

                insights.kpis.revenue_forecast_next_period = forecast.toFixed(2);
                insights.hypothesis.push("🔮 Forecasted revenue for next period using linear regression.");
            }
        } catch (err) {
            insights.hypothesis.push("⚠️ Forecasting failed: " + err.message);
        }
    }

    return insights;
}

module.exports = { getFinanceInsights };
