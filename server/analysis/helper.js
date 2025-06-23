const dfd = require("danfojs-node");
const ss = require("simple-statistics");

/**
 * Group by a column and apply aggregation (sum, mean, count, median, min, max).
 */
function groupByAndAggregate(df, groupByCol, valueCol, aggType = "sum") {
    if (!df.columns.includes(groupByCol) || !df.columns.includes(valueCol)) {
        console.warn(`⚠️  One or both columns missing: ${groupByCol}, ${valueCol}`);
        return null;
    }

    // Ensure numeric conversion
    const cleanNumeric = df[valueCol].values.map(v =>
        typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]+/g, "")) || 0 :
            typeof v === "number" ? v : 0
    );

    df.addColumn(valueCol, cleanNumeric, { inplace: true });

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
        const values = groups[key];

        let aggValue;
        switch (aggType) {
            case "mean":
                aggValue = ss.mean(values);
                break;
            case "median":
                aggValue = ss.median(values);
                break;
            case "min":
                aggValue = Math.min(...values);
                break;
            case "max":
                aggValue = Math.max(...values);
                break;
            case "count":
                aggValue = values.length;
                break;
            case "sum":
            default:
                aggValue = values.reduce((a, b) => a + b, 0);
        }

        result[valueCol].push(parseFloat(aggValue.toFixed(2)));
    }

    return new dfd.DataFrame(result);
}

/**
 * Detects outliers using IQR method.
 */
function detectOutliers(data) {
    const clean = data.filter(v => typeof v === "number" && !isNaN(v));
    if (!clean.length) return [];

    const q1 = ss.quantile(clean, 0.25);
    const q3 = ss.quantile(clean, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;

    return clean.filter(v => v < lower || v > upper);
}

/**
 * Computes correlation between two numeric columns.
 */
function correlation(df, col1, col2) {
    if (!df.columns.includes(col1) || !df.columns.includes(col2)) {
        console.warn(`⚠️  Missing column for correlation: ${col1} or ${col2}`);
        return 0;
    }

    const vals1 = df[col1].values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const vals2 = df[col2].values.map(v => parseFloat(v)).filter(v => !isNaN(v));

    if (!vals1.length || !vals2.length || vals1.length !== vals2.length) {
        console.warn(`⚠️  Cannot compute correlation: Unequal or empty value arrays.`);
        return 0;
    }

    return parseFloat(ss.sampleCorrelation(vals1, vals2).toFixed(4));
}

function trendAnalysis(df, dateCol, valueCol) {
    if (!df.columns.includes(dateCol) || !df.columns.includes(valueCol)) {
        console.warn(`⚠️  Missing columns for trend analysis: ${dateCol}, ${valueCol}`);
        return [];
    }

    const grouped = {};

    for (let i = 0; i < df.shape[0]; i++) {
        const rawDate = df[dateCol].values[i];
        const rawValue = df[valueCol].values[i];

        const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
        const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);

        if (isNaN(value) || !(date instanceof Date) || isNaN(date.getTime())) {
            console.warn(`⚠️ Skipped row ${i}: Invalid date or value`, {
                rawDate,
                parsedDate: date,
                rawValue,
                parsedValue: value
            });
            continue;
        }

        const key = date.toISOString().split("T")[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(value);
    }

    const sortedDates = Object.keys(grouped).sort();
    if (sortedDates.length === 0) {
        console.warn("⚠️ No valid grouped date keys found. Check input date/value columns.");
        return [];
    }

    let lastTotal = 0;
    let cumulative = 0;

    return sortedDates.map(date => {
        const values = grouped[date];
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        cumulative += total;

        const change = lastTotal === 0 ? 0 : ((total - lastTotal) / lastTotal) * 100;
        lastTotal = total;

        return {
            date,
            total: parseFloat(total.toFixed(2)),
            avg: parseFloat(avg.toFixed(2)),
            count: values.length,
            cumulative: parseFloat(cumulative.toFixed(2)),
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
