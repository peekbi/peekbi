const { parseExcelBuffer } = require('./parser');
const { cleanData } = require('./cleaner');
const { computeStats } = require('./analyzer');
const { groupSum, detectOutliers } = require('./insight');
const { predictTrend } = require('./predict');
const { inferSchema } = require('./schema/inferSchema');
const { logInfo, logError } = require('./utils/logger');

async function runAnalysis(buffer) {
    try {
        logInfo('Starting analysis...');
        const raw = parseExcelBuffer(buffer);
        const cleaned = cleanData(raw);
        const schema = inferSchema(cleaned);

        logInfo(`Schema inferred: ${JSON.stringify(schema)}`);

        const stats = {};
        for (const metric of schema.metrics) {
            stats[metric] = computeStats(cleaned, metric);
        }

        const insights = {};
        if (schema.dimensions.length) {
            insights.groupedBy = groupSum(cleaned, schema.dimensions[0], schema.metrics[0]);
        }

        insights.outliers = detectOutliers(cleaned, schema.metrics[0]);

        const prediction = predictTrend(cleaned, schema.primaryKey, schema.metrics[0]);

        return {
            meta: {
                recordCount: {
                    raw: raw.length,
                    cleaned: cleaned.length
                },
                schema
            },
            stats,
            insights,
            prediction
        };
    } catch (err) {
        logError(`Analysis failed: ${err.message}`);
        throw err;
    }
}

module.exports = { runAnalysis };
