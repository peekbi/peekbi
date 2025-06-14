// cleaner.js
const df = require('danfojs-node');

function cleanData(rawData) {
    const dataFrame = new df.DataFrame(rawData);

    // Remove empty columns
    const cleaned = dataFrame.dropNa({ axis: 1 });

    // Normalize column names
    cleaned.columns = cleaned.columns.map(col => col.trim().toLowerCase().replace(/\s+/g, '_'));

    return cleaned;
}

module.exports = { cleanData };
