const { Worker } = require("worker_threads");
const path = require("path");

function runWorker(type, data) {
    const workerPath = path.join(__dirname, "../analysis/utils/retailWorker.js");

    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
            workerData: { type, ...data },
        });

        worker.on("message", (message) => {
            if (message.error) {
                reject(new Error(message.error));
            } else {
                resolve(message.result);
            }
        });

        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

module.exports = { runWorker };
