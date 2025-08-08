/**
 * Safe statistical utility functions that handle edge cases
 */

function safeSum(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    return values.reduce((sum, val) => {
        const num = parseFloat(val);
        return sum + (isNaN(num) ? 0 : num);
    }, 0);
}

function safeMean(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = values.filter(val => !isNaN(parseFloat(val)));
    if (validValues.length === 0) return 0;
    return safeSum(validValues) / validValues.length;
}

function safeMedian(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = values
        .map(val => parseFloat(val))
        .filter(val => !isNaN(val))
        .sort((a, b) => a - b);

    if (validValues.length === 0) return 0;

    const mid = Math.floor(validValues.length / 2);
    return validValues.length % 2 === 0
        ? (validValues[mid - 1] + validValues[mid]) / 2
        : validValues[mid];
}

function safeMin(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = values.filter(val => !isNaN(parseFloat(val)));
    return validValues.length > 0 ? Math.min(...validValues) : 0;
}

function safeMax(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = values.filter(val => !isNaN(parseFloat(val)));
    return validValues.length > 0 ? Math.max(...validValues) : 0;
}

function safeStandardDeviation(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = values.filter(val => !isNaN(parseFloat(val)));
    if (validValues.length <= 1) return 0;

    const mean = safeMean(validValues);
    const squaredDiffs = validValues.map(val => Math.pow(parseFloat(val) - mean, 2));
    return Math.sqrt(safeSum(squaredDiffs) / (validValues.length - 1));
}

module.exports = {
    safeSum,
    safeMean,
    safeMedian,
    safeMin,
    safeMax,
    safeStandardDeviation
};