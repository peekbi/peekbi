// analyzer.js
const ss = require('simple-statistics');

function analyzeOverallStats(df) {
    const numericCols = df.columns.filter(col => df[col].dtype === 'float32' || df[col].dtype === 'int32');

    const summary = {};
    numericCols.forEach(col => {
        const values = df[col].values.filter(v => typeof v === 'number');
        summary[col] = {
            min: ss.min(values),
            max: ss.max(values),
            mean: ss.mean(values),
            median: ss.median(values),
            stddev: ss.standardDeviation(values),
        };
    });

    return summary;
}

module.exports = { analyzeOverallStats };
