const ss = require("simple-statistics");

// Smarter number parser
function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        // Remove $ and spaces, keep dot and minus, remove commas
        const cleaned = val.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    return null;
}

function detectType(values) {
    const cleaned = values.filter(v => v !== null && v !== undefined);
    if (cleaned.length === 0) return "unknown";

    const uniqueVals = Array.from(new Set(cleaned));
    if (uniqueVals.length === 1) return "constant";

    let numericCount = 0, dateCount = 0, boolCount = 0;

    for (const v of cleaned) {
        const raw = typeof v === "string" ? v.trim().toLowerCase() : v;

        const num = parseNumber(raw);
        if (num !== null) {
            numericCount++;
            continue;
        }

        if (raw === true || raw === false || raw === "yes" || raw === "no" || raw === "y" || raw === "n") {
            boolCount++;
            continue;
        }

        const d = new Date(v);
        if (!isNaN(d.getTime())) {
            dateCount++;
            continue;
        }
    }

    const total = cleaned.length;
    if (numericCount / total > 0.6) return "numeric";
    if (boolCount / total > 0.6) return "boolean";
    if (dateCount / total > 0.6) return "date";
    return "categorical";
}

function analyzeOverallStats(df) {
    const summary = {};

    df.columns.forEach(col => {
        const rawValues = df[col].values || [];
        const values = rawValues.filter(v => v !== undefined && v !== null);
        const unique = Array.from(new Set(values));

        if (unique.length === 1) {
            summary[col] = {
                type: "constant",
                value: unique[0],
                note: "Single unique value"
            };
            return;
        }

        const detectedType = detectType(values);

        if (detectedType === "numeric") {
            const nums = values.map(parseNumber).filter(n => n !== null);
            if (nums.length === 0) {
                summary[col] = {
                    type: "numeric",
                    count: 0,
                    note: "No valid numbers parsed"
                };
            } else {
                summary[col] = {
                    type: "numeric",
                    count: nums.length,
                    min: ss.min(nums),
                    max: ss.max(nums),
                    mean: parseFloat(ss.mean(nums).toFixed(2)),
                    median: ss.median(nums),
                    stddev: parseFloat(ss.standardDeviation(nums).toFixed(2))
                };
            }
        } else if (detectedType === "date") {
            const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
            const timestamps = dates.map(d => d.getTime());
            summary[col] = {
                type: "date",
                count: dates.length,
                min_date: new Date(Math.min(...timestamps)).toISOString(),
                max_date: new Date(Math.max(...timestamps)).toISOString(),
                range_days: parseFloat(((Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24)).toFixed(1))
            };
        } else if (detectedType === "boolean") {
            const boolMap = { true: 0, false: 0 };
            values.forEach(v => {
                const val = String(v).toLowerCase();
                if (val === "yes" || val === "y" || val === "true" || v === true) boolMap.true++;
                else boolMap.false++;
            });
            summary[col] = {
                type: "boolean",
                counts: [
                    { value: true, count: boolMap.true },
                    { value: false, count: boolMap.false }
                ]
            };
        } else {
            const freqMap = {};
            values.forEach(v => {
                const key = String(v).trim();
                freqMap[key] = (freqMap[key] || 0) + 1;
            });
            const topValues = Object.entries(freqMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([value, count]) => ({ value, count }));
            summary[col] = {
                type: "categorical",
                top_values: topValues,
                unique_count: unique.length
            };
        }
    });

    return summary;
}

module.exports = {
    analyzeOverallStats,
};
