const ss = require('simple-statistics');

/**
 * Filters for numbers and safely computes the sum.
 */
function safeSum(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.reduce((a, b) => a + b, 0);
}

/**
 * Safely computes mean (average) for numeric values.
 */
function safeMean(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.mean(nums) : 0;
}

/**
 * Safely computes the median for numeric values.
 */
function safeMedian(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.median(nums) : 0;
}

/**
 * Safely computes the maximum value.
 */
function safeMax(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.max(nums) : 0;
}

/**
 * Safely computes the minimum value.
 */
function safeMin(values) {
    const nums = values.filter(v => typeof v === 'number' && !isNaN(v));
    return nums.length ? ss.min(nums) : 0;
}

module.exports = {
    safeSum,
    safeMean,
    safeMedian,
    safeMax,
    safeMin,
};
