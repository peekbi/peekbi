const dfd = require("danfojs-node");
const ss = require("simple-statistics");
const { groupByAndAggregate, detectOutliers, correlation, trendAnalysis } = require("./helper");
const { safeSum, safeMean, safeMedian, safeMax, safeMin } = require("./utils/statsUtils");
const { getRetailInsights } = require("./insights/retailInsights");
const { getFinanceInsights } = require("./insights/financeInsights");
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
            const match = (keywords) =>
                df.columns.find(col => keywords.some(k => col.toLowerCase().replace(/[\s_]/g, '').includes(k)));
            return getRetailInsights(df, match);
        }

        case 'finance': {
            insights = getFinanceInsights(df, colMatch);
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
