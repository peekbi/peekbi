const ss = require('simple-statistics');

/**
 * Filters for numbers and safely computes the sum.
 */
function safeSum(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.reduce((a, b) => a + b, 0);
}

function safeMean(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.mean(nums) : 0;
}

function safeMedian(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.median(nums) : 0;
}

function safeMax(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.max(nums) : 0;
}

function safeMin(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.min(nums) : 0;
}

/**
 * Safely computes the min/max date and range in days.
 */
function safeDateRange(values) {
    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
    if (dates.length === 0) return null;
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const rangeDays = (max - min) / (1000 * 60 * 60 * 24);
    return { min, max, rangeDays };
}

module.exports = {
    safeSum,
    safeMean,
    safeMedian,
    safeMax,
    safeMin,
    safeDateRange,
};
