const dfd = require("danfojs-node");
const ss = require("simple-statistics");
/**
 * Group by a column and apply aggregation (sum, mean, count).
 */
function groupByAndAggregate(df, groupByCol, valueCol, aggType = "sum") {
    if (!df.columns.includes(groupByCol) || !df.columns.includes(valueCol)) {
        console.warn(`⚠️  One or both columns missing: ${groupByCol}, ${valueCol}`);
        return null;
    }

    const groups = {};

    for (let i = 0; i < df.shape[0]; i++) {
        const key = df[groupByCol].values[i];
        const value = df[valueCol].values[i];
        if (typeof value !== "number" || isNaN(value)) continue;

        if (!groups[key]) groups[key] = [];
        groups[key].push(value);
    }

    if (Object.keys(groups).length === 0) {
        console.warn(`⚠️  No numeric values found for aggregation: ${groupByCol}, ${valueCol}`);
        return null;
    }

    const result = {
        [groupByCol]: [],
        [valueCol]: [],
    };

    for (const key in groups) {
        result[groupByCol].push(key);
        switch (aggType) {
            case "sum":
                result[valueCol].push(groups[key].reduce((a, b) => a + b, 0));
                break;
            case "mean":
                result[valueCol].push(
                    groups[key].reduce((a, b) => a + b, 0) / groups[key].length
                );
                break;
            case "count":
            default:
                result[valueCol].push(groups[key].length);
        }
    }

    return new dfd.DataFrame(result);
}

/**
 * Detects outliers using IQR method.
 */
function detectOutliers(data) {
    const q1 = ss.quantile(data, 0.25);
    const q3 = ss.quantile(data, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;

    return data.filter((v) => v < lower || v > upper);
}

/**
 * Computes correlation between two numeric columns.
 */
function correlation(df, col1, col2) {
    if (!df.columns.includes(col1) || !df.columns.includes(col2)) {
        console.warn(`⚠️  Cannot compute correlation: Missing column ${!df.columns.includes(col1) ? col1 : col2}`);
        return 0;
    }

    const vals1 = df[col1].values.filter(v => typeof v === "number");
    const vals2 = df[col2].values.filter(v => typeof v === "number");

    if (!vals1.length || !vals2.length || vals1.length !== vals2.length) {
        console.warn(`⚠️  Correlation failed due to empty or unequal length arrays: ${col1}, ${col2}`);
        return 0;
    }

    return ss.sampleCorrelation(vals1, vals2);
}


/**
 * Generates average trend per date.
 */
function trendAnalysis(df, dateCol, valueCol) {
    if (!df.columns.includes(dateCol) || !df.columns.includes(valueCol)) {
        console.warn(`⚠️  Cannot perform trend analysis: Missing columns ${dateCol} or ${valueCol}`);
        return [];
    }

    const grouped = {};

    for (let i = 0; i < df.shape[0]; i++) {
        const rawDate = df[dateCol].values[i];
        const rawValue = df[valueCol].values[i];

        const date = new Date(rawDate);
        const value = parseFloat(rawValue);

        if (isNaN(date) || isNaN(value)) continue;

        const key = date.toISOString().split("T")[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(value);
    }

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

    let lastTotal = 0;
    let cumulative = 0;

    return sortedDates.map(date => {
        const values = grouped[date];
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        const orderCount = values.length;
        const avgOrderValue = total / (orderCount || 1);
        cumulative += total;

        const change = lastTotal === 0 ? 0 : ((total - lastTotal) / lastTotal) * 100;
        lastTotal = total;

        return {
            date,
            total: total,
            avg: avg,
            count: orderCount,
            avg_value: avgOrderValue,
            cumulative_: cumulative,
            change_percent: parseFloat(change.toFixed(2))
        };
    });
}


module.exports = {
    groupByAndAggregate,
    detectOutliers,
    correlation,
    trendAnalysis,
};
