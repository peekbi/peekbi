// index.js
const { parseExcelBuffer } = require('./parser');
const { cleanData } = require('./cleaner');
const { analyzeOverallStats } = require('./analyzer');
const {
    groupByAndAggregate,
    detectOutliers,
    correlation,
    trendAnalysis,
    getInsightsByCategory,
} = require('./insight');
const { linearPrediction, movingAverage } = require('./predict');

module.exports = {
    parseExcelBuffer,
    cleanData,
    analyzeOverallStats,
    groupByAndAggregate,
    detectOutliers,
    correlation,
    trendAnalysis,
    getInsightsByCategory,
    linearPrediction,
    movingAverage,
};
