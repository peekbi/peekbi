const { parentPort, workerData } = require("worker_threads");

function cleanValues(values) {
    return Array.isArray(values)
        ? values
              .map(v => (typeof v === 'string' ? parseFloat(v) : v))
              .filter(v => typeof v === 'number' && !isNaN(v))
        : [];
}

function compute(values1, values2, operation) {
    return values1.map((val, i) => {
        const a = parseFloat(val) || 0;
        const b = parseFloat(values2[i]) || 0;
        switch (operation) {
            case "multiply":
                return a * b;
            case "subtract":
                return a - b;
            default:
                return 0;
        }
    });
}

const { type, values, values1, values2, operation } = workerData;

let result = [];

try {
    if (type === "clean") {
        result = cleanValues(values);
    } else if (type === "compute") {
        result = compute(values1, values2, operation);
    }
} catch (err) {
    parentPort.postMessage({ error: err.message });
}

parentPort.postMessage({ result });
