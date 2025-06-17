const dfd = require("danfojs-node");
const { groupByAndAggregate, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMedian } = require("../utils/statsUtils");

function getFinanceInsights(df, match) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    // Auto-matching typical finance fields
    const cols = {
        revenue: ['revenue', 'sales', 'operating_income', 'total_income', 'data_value'],
        expenses: ['expense', 'expenses', 'cost'],
        department: ['department', 'industry', 'sector', 'series_title_2'],
        metric: ['series_title_1', 'subject', 'group'],
        date: ['date', 'period', 'order_date'],
    };

    const colMatch = (type) => match(cols[type]);

    const revenueCol = colMatch('revenue') || 'data_value';
    const expensesCol = colMatch('expenses');
    const deptCol = colMatch('department') || 'series_title_2';
    const metricCol = colMatch('metric') || 'series_title_1';
    const dateCol = colMatch('date') || 'period';

    const cleanNum = (vals) =>
        Array.isArray(vals)
            ? vals.map(v => typeof v === 'string' ? parseFloat(v) : v)
                .filter(v => typeof v === 'number' && !isNaN(v))
            : [];

    const revenueVals = cleanNum(df[revenueCol]?.values ?? []);
    const expensesVals = cleanNum(df[expensesCol]?.values ?? []);

    const totalRevenue = safeSum(revenueVals);
    const totalExpenses = safeSum(expensesVals);
    const netProfit = totalRevenue - totalExpenses;

    insights.kpis = {
        total_revenue: totalRevenue,
        avg_revenue: safeMean(revenueVals),
        median_revenue: safeMedian(revenueVals),
    };

    if (expensesCol) {
        insights.kpis.total_expenses = totalExpenses;
        insights.kpis.avg_expenses = safeMean(expensesVals);
        insights.kpis.net_profit = netProfit;
    }

    if (deptCol && revenueCol && df.columns.includes(deptCol)) {
        const grouped = groupByAndAggregate(df, deptCol, revenueCol, 'sum');
        if (grouped && grouped.shape[0] > 0) {
            grouped.sortValues(revenueCol, { ascending: false, inplace: true });
            insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
            insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
            insights.totals.revenue_by_department = dfd.toJSON(grouped, { format: "row" });
        }
    }

    // Trend over time
    if (dateCol && df.columns.includes(dateCol) && df.shape[0] < 10000) {
        insights.trends = trendAnalysis(df, dateCol, revenueCol);
    }

    // Hypothesis suggestions
    if (expensesCol) {
        insights.hypothesis.push("📊 Analyze whether departments with higher revenue also incur proportionally higher expenses.");
    } else {
        insights.hypothesis.push("💡 No expense data available, focusing on revenue-based insights.");
    }

    if (metricCol) {
        const metrics = df[metricCol].unique().values;
        insights.hypothesis.push(`🧾 Dataset includes multiple metrics: ${metrics.slice(0, 3).join(', ')}${metrics.length > 3 ? ', ...' : ''}`);
    }

    return insights;
}

module.exports = { getFinanceInsights };
