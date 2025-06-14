// Helper function to check if a value is numeric
const isNumeric = (value) => {
    if (typeof value === 'number') return true;
    if (typeof value !== 'string') return false;
    return !isNaN(value) && !isNaN(parseFloat(value));
};

// Calculate basic statistics for a numeric column
const calculateBasicStats = (data, column) => {
    const values = data
        .map(row => parseFloat(row[column]))
        .filter(val => !isNaN(val));

    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean,
        median,
        sum,
        count: values.length
    };
};

// Calculate correlation between two numeric columns
const calculateCorrelation = (data, col1, col2) => {
    const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
    const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));

    if (values1.length === 0 || values2.length === 0) return null;

    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

    const covariance = values1.reduce((sum, val1, i) => {
        return sum + (val1 - mean1) * (values2[i] - mean2);
    }, 0) / values1.length;

    const std1 = Math.sqrt(values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / values1.length);
    const std2 = Math.sqrt(values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / values2.length);

    return covariance / (std1 * std2);
};

// Analyze time series data
const analyzeTimeSeries = (data, timeColumn, valueColumn) => {
    const timeSeries = data
        .map(row => ({
            time: row[timeColumn],
            value: parseFloat(row[valueColumn])
        }))
        .filter(point => !isNaN(point.value))
        .sort((a, b) => a.time.localeCompare(b.time));

    if (timeSeries.length === 0) return null;

    const values = timeSeries.map(point => point.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values[values.length - 1] - values[0];

    return {
        data: timeSeries,
        mean,
        trend,
        isIncreasing: trend > 0,
        isDecreasing: trend < 0
    };
};

// Analyze distribution of categorical values
const analyzeDistribution = (data, column) => {
    const distribution = data.reduce((acc, row) => {
        const value = row[column];
        if (value) {
            acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
    }, {});

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    const distributionArray = Object.entries(distribution)
        .map(([value, count]) => ({
            value,
            count,
            percentage: (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count);

    return {
        distribution: distributionArray,
        total,
        uniqueValues: distributionArray.length
    };
};

// Detect patterns in data
const detectPatterns = (data, column) => {
    const values = data.map(row => row[column]);
    const uniqueValues = new Set(values);
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const duplicateCount = values.length - uniqueValues.size;

    return {
        isNumeric: values.every(v => isNumeric(v)),
        hasNulls: nullCount > 0,
        nullPercentage: (nullCount / values.length) * 100,
        hasDuplicates: duplicateCount > 0,
        duplicatePercentage: (duplicateCount / values.length) * 100,
        uniqueCount: uniqueValues.size
    };
};

// Main analysis function
export const analyzeData = (data, headers) => {
    const numericColumns = headers.filter(header => 
        data.every(row => isNumeric(row[header]))
    );
    const categoricalColumns = headers.filter(header => 
        !numericColumns.includes(header)
    );

    const basicStats = {};
    numericColumns.forEach(column => {
        basicStats[column] = calculateBasicStats(data, column);
    });

    const correlations = {};
    for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
            const col1 = numericColumns[i];
            const col2 = numericColumns[j];
            correlations[`${col1}-${col2}`] = calculateCorrelation(data, col1, col2);
        }
    }

    const timeSeries = {};
    if (headers.includes('Year')) {
        numericColumns.forEach(column => {
            if (column !== 'Year') {
                timeSeries[column] = analyzeTimeSeries(data, 'Year', column);
            }
        });
    }

    const distributions = {};
    categoricalColumns.forEach(column => {
        distributions[column] = analyzeDistribution(data, column);
    });

    const patterns = {};
    headers.forEach(column => {
        patterns[column] = detectPatterns(data, column);
    });

    return {
        basic: {
            totalRows: data.length,
            totalColumns: headers.length,
            numericColumns,
            categoricalColumns,
            columnTypes: headers.reduce((acc, header) => {
                acc[header] = {
                    type: numericColumns.includes(header) ? 'numeric' : 'categorical',
                    stats: basicStats[header]
                };
                return acc;
            }, {})
        },
        correlations,
        timeSeries,
        distributions,
        patterns
    };
}; 