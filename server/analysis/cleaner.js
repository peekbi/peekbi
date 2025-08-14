const df = require('danfojs-node');
const { parse } = require('date-fns');

/**
 * Safely parses a date from various formats or Excel serial numbers.
 */
function safeParseDate(val) {
    if (!val) return null;

    if (typeof val === 'number') {
        if (val > 30000 && val < 60000) {
            const excelEpoch = new Date(1899, 11, 30);
            return new Date(excelEpoch.getTime() + val * 24 * 60 * 60 * 1000);
        }
        return null;
    }

    if (typeof val === 'string') {
        const cleaned = val.trim();
        if (!/[/-]|^\d{8}$/.test(cleaned)) return null;

        const formats = [
            'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy',
            'yyyyMMdd', 'dd-MM-yyyy', 'MM-dd-yyyy'
        ];

        for (const fmt of formats) {
            try {
                const parsed = parse(cleaned, fmt, new Date());
                if (!isNaN(parsed.getTime())) return parsed;
            } catch (_) { }
        }

        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
}

/**
 * Cleans and normalizes the raw data:
 * - Removes empty columns
 * - Normalizes column names
 * - Converts date columns to JavaScript Date objects
 */
function cleanData(rawData) {

    let dataFrame = new df.DataFrame(rawData);

    // Drop columns where all values are null/empty
    const nonEmptyColumns = dataFrame.columns.filter(col =>
        dataFrame[col].values.some(v => v !== null && v !== undefined && v !== '')
    );
    dataFrame = dataFrame.loc({ columns: nonEmptyColumns });

    // Normalize column names
    dataFrame.columns = dataFrame.columns.map(col =>
        col.trim().toLowerCase().replace(/\s+/g, '_')
    );
    const normalizedCols = dataFrame.columns;

    // Convert data
    const newData = {};
    for (let col of normalizedCols) {
        const values = Array.from(dataFrame[col].values);
        const sample = values.slice(0, 5);
        const validDateCount = sample.filter(v => safeParseDate(v)).length;

        // 👉 Instead of numeric timestamps, use Date objects
        newData[col] = validDateCount >= 3
            ? values.map(v => safeParseDate(v) || null)
            : values;
    }

    return new df.DataFrame(newData);
}

module.exports = { cleanData };
