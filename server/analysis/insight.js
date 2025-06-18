
const { groupByAndAggregate, detectOutliers, correlation, trendAnalysis } = require("./helper");
const { getRetailInsights } = require("./insights/retailInsights");
const { getFinanceInsights } = require("./insights/financeInsights");
const { getHealthcareInsights } = require("./insights/healthcareInsights");
const { getManufacturingInsights } = require("./insights/manufacturIngInsights");
const { getEducationInsights } = require("./insights/educationInsights");
function getInsightsByCategory(df, category) {
    let insights = {
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
            const match = (keywords) =>
                df.columns.find(col =>
                    keywords
                        .filter(k => typeof k === 'string')
                        .some(k => col.toLowerCase().replace(/[\s_]/g, '').includes(k.toLowerCase()))
                );

            try {
                Object.assign(insights, getFinanceInsights(df, match)); // ✅ FIXED
            } catch (err) {
                console.error("Error in getFinanceInsights:", err.message);
                insights.hypothesis.push("⚠️ Could not generate finance insights due to missing or invalid columns.");
            }
            break;
        }

        case 'manufacturing': {
            try {
                Object.assign(insights, getManufacturingInsights(df));
            } catch (err) {
                console.error("Error in getManufacturingInsights:", err.message);
                insights.hypothesis.push("⚠️ Could not generate manufacturing insights due to missing or invalid columns.");
            }
            break;
        }


        case 'education': {
            try {
                Object.assign(insights, getEducationInsights(df));
            } catch (err) {
                console.error("Error in getEducationInsights:", err.message);
                insights.hypothesis.push("⚠️ Could not generate education insights.");
            }
            break;
        }


        case 'healthcare': {
            const match = (keywords) =>
                df.columns.find(col =>
                    keywords.some(k =>
                        col.toLowerCase().replace(/[\s_]/g, '').includes(k.toLowerCase())
                    )
                );

            try {
                Object.assign(insights, getHealthcareInsights(df, match));
            } catch (err) {
                console.error("Error in getHealthcareInsights:", err.message);
                insights.hypothesis.push("⚠️ Could not generate healthcare insights due to missing or invalid columns.");
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
