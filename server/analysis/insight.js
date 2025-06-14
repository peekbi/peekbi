const dfd = require("danfojs-node");
const ss = require("simple-statistics");
const { groupByAndAggregate, detectOutliers, correlation, trendAnalysis } = require("./helper");
const { safeSum, safeMean, safeMedian, safeMax, safeMin } = require("./utils/statsUtils");

function getInsightsByCategory(df, category) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    const colMatch = (keyword) => df.columns.find(col => col.toLowerCase().includes(keyword.toLowerCase()));

    switch (category.toLowerCase()) {
        case 'retail': {
            const sales = colMatch('sales');
            const profit = colMatch('profit');
            const loss = colMatch('loss');
            const region = colMatch('region');
            const cat = colMatch('category');

            const salesVals = df[sales]?.values ?? [];
            const profitVals = df[profit]?.values ?? [];
            const lossVals = df[loss]?.values ?? [];

            insights.kpis = {
                total_sales: safeSum(salesVals),
                total_profit: safeSum(profitVals),
                total_loss: loss ? safeSum(lossVals) : safeSum(salesVals) - safeSum(profitVals),
                avg_sales: safeMean(salesVals),
                median_sales: safeMedian(salesVals),
            };

            if (cat && sales) {
                const grouped = groupByAndAggregate(df, cat, sales, 'sum');
                if (grouped) {
                    grouped.sortValues(sales, { ascending: false, inplace: true });
                    insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
                    insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
                }
            }

            if (profit && loss) {
                const corr = correlation(df, profit, loss);
                insights.hypothesis.push(`Profit and Loss correlation: ${corr.toFixed(2)}`);
            } else if (profit && sales) {
                const profitMargin = safeMean(df[profit].values) / (safeMean(df[sales].values) || 1);
                insights.hypothesis.push(`Average profit margin is ${(profitMargin * 100).toFixed(2)}%. Consider evaluating products with low margin.`);
            } else if (sales) {
                insights.hypothesis.push(`Sales distribution shows differences across categories. Consider investigating underperforming ones.`);
            }


            if (region && sales) {
                const grouped = groupByAndAggregate(df, region, sales, 'sum');
                if (grouped) {
                    insights.totals.sales_by_region = dfd.toJSON(grouped, { format: "row" });
                }
            }

            if (cat && sales) {
                const grouped = groupByAndAggregate(df, cat, sales, 'sum');
                if (grouped) {
                    insights.totals.sales_by_category = dfd.toJSON(grouped, { format: "row" });
                }
            }

            const dateCol = colMatch('date');
            if (dateCol && sales) {
                insights.trends = trendAnalysis(df, dateCol, sales);
            }

            break;
        }

        case 'finance': {
            const revenue = colMatch('revenue');
            const expenses = colMatch('expense');
            const dept = colMatch('department');

            const revenueVals = df[revenue]?.values ?? [];
            const expensesVals = df[expenses]?.values ?? [];

            insights.kpis = {
                total_revenue: safeSum(revenueVals),
                total_expenses: safeSum(expensesVals),
                net_profit: safeSum(revenueVals) - safeSum(expensesVals),
            };

            if (revenue && expenses) {
                insights.hypothesis.push("Check if departments with higher revenue also have higher expenses.");
            }

            if (dept && revenue) {
                const grouped = groupByAndAggregate(df, dept, revenue, 'sum');
                if (grouped) {
                    grouped.sortValues(revenue, { ascending: false, inplace: true });
                    insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
                    insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
                }
            }

            break;
        }

        case 'education': {
            const marks = colMatch('mark') || colMatch('score');
            const subject = colMatch('subject');

            const marksVals = df[marks]?.values ?? [];

            insights.kpis = {
                avg_marks: safeMean(marksVals),
                max_marks: safeMax(marksVals),
                pass_rate: (marksVals.filter(m => m >= 40).length / marksVals.length * 100).toFixed(2) + '%',
            };

            if (subject && marks) {
                const grouped = groupByAndAggregate(df, subject, marks, 'mean');
                if (grouped) {
                    grouped.sortValues(marks, { ascending: false, inplace: true });
                    insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
                    insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
                    insights.hypothesis.push("Subjects with lower scores may need curriculum improvement.");
                }
            }

            const dateCol = colMatch('date');
            if (dateCol && marks) {
                insights.trends = trendAnalysis(df, dateCol, marks);
            }

            break;
        }

        case 'healthcare': {
            const cost = colMatch('cost');
            const disease = colMatch('disease');
            const department = colMatch('department');

            const costVals = df[cost]?.values ?? [];

            insights.kpis = {
                total_treatment_cost: safeSum(costVals),
                avg_treatment_cost: safeMean(costVals),
                max_treatment_cost: safeMax(costVals),
            };

            if (disease && cost) {
                const grouped = groupByAndAggregate(df, disease, cost, 'mean');
                if (grouped) {
                    grouped.sortValues(cost, { ascending: false, inplace: true });
                    insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
                    insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
                    insights.hypothesis.push("High-cost diseases may be chronic or need specialized care.");
                }
            }

            if (department && cost) {
                const grouped = groupByAndAggregate(df, department, cost, 'sum');
                if (grouped) {
                    insights.totals.cost_by_department = dfd.toJSON(grouped, { format: "row" });
                }
            }

            break;
        }

        case 'tech': {
            const dev = colMatch('developer') || colMatch('team');
            const bugs = colMatch('bug');
            const features = colMatch('feature');
            const delivery = colMatch('delivery');
            const cost = colMatch('cost');

            const bugsVals = df[bugs]?.values ?? [];
            const featuresVals = df[features]?.values ?? [];

            insights.kpis = {
                total_bugs: safeSum(bugsVals),
                total_features: safeSum(featuresVals),
                bugs_per_feature: (safeSum(bugsVals) / (safeSum(featuresVals) || 1)).toFixed(2),
            };

            if (dev && bugs) {
                const grouped = groupByAndAggregate(df, dev, bugs, 'sum');
                if (grouped) {
                    grouped.sortValues(bugs, { ascending: true, inplace: true });
                    insights.highPerformers = dfd.toJSON(grouped.head(3), { format: "row" });
                    insights.lowPerformers = dfd.toJSON(grouped.tail(3), { format: "row" });
                    insights.hypothesis.push("Teams with high bugs need code review or more QA.");
                }
            }

            if (delivery && cost) {
                const grouped = groupByAndAggregate(df, delivery, cost, 'sum');
                if (grouped) {
                    insights.totals.delivery_costs = dfd.toJSON(grouped, { format: "row" });
                }
            }

            break;
        }

        default:
            insights.hypothesis.push("Unknown category. No specific insights generated.");
    }

    return insights;
}

module.exports = {
    getInsightsByCategory,
    groupByAndAggregate,
    detectOutliers,
    correlation,
    trendAnalysis
};
