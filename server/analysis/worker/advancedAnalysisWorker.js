const env = require('dotenv');
env.config();
const dfd = require('danfojs-node');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../../utils/s3Client');
const { decryptBuffer } = require('../../utils/encryption');
const analysis = require('..');
const UserFile = require('../../model/fileModel');
const db = require('../../config/db');

const BUCKET_NAME = 'peekbi-usersfiles';

async function appendLog(userId, fileId, level, message) {
    try {
        const doc = await UserFile.findOne({ userId });
        if (!doc) return;
        const file = doc.files.id(fileId);
        if (!file) return;
        file.analysisLogs = [...(file.analysisLogs || []), { level, message }];
        await doc.save();
    } catch (_) {}
}

async function setStatus(userId, fileId, status) {
    try {
        const doc = await UserFile.findOne({ userId });
        if (!doc) return;
        const file = doc.files.id(fileId);
        if (!file) return;
        file.analysisStatus = status;
        await doc.save();
    } catch (_) {}
}

async function runAdvancedAnalysis({ userId, fileId, fileCategory }) {
    console.log(`[Worker] Starting advanced analysis for user=${userId} file=${fileId}`);
    await appendLog(userId, fileId, 'info', 'Background worker started');
    await setStatus(userId, fileId, 'advanced_processing');

    let heartbeat;
    let startTs = Date.now();
    try {
        // Heartbeat every 15s
        heartbeat = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTs) / 1000);
            appendLog(userId, fileId, 'info', `Processing heartbeat: elapsed ${elapsed}s`);
        }, 15000);

        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) throw new Error('User not found');
        const fileEntry = userDoc.files.id(fileId);
        if (!fileEntry) throw new Error('File not found');

        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));
        const chunks = [];
        const d0 = Date.now();
        await new Promise((resolve, reject) => {
            s3Response.Body.on('data', (chunk) => chunks.push(chunk));
            s3Response.Body.on('end', resolve);
            s3Response.Body.on('error', reject);
        });
        console.log(`[Worker] S3 download time: ${Date.now() - d0}ms, bytes=${chunks.reduce((a,b)=>a+b.length,0)}`);
        const encryptedBuffer = Buffer.concat(chunks);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        const jsonData = JSON.parse(decryptedBuffer.toString());

        const df = new dfd.DataFrame(jsonData);
        console.log(`[Worker] DataFrame shape rows=${df.shape[0]} cols=${df.shape[1]} category=${fileCategory}`);
        const t1 = Date.now();
        const insights = analysis.getInsightsByCategory(df, fileCategory);
        console.log(`[Worker] getInsightsByCategory time: ${Date.now() - t1}ms`);

        fileEntry.analysis = fileEntry.analysis || {};
        fileEntry.analysis.insights = insights;
        fileEntry.analysisStatus = 'advanced_ready';
        fileEntry.advancedAnalysisCompletedAt = new Date();
        fileEntry.advancedAnalysisError = undefined;
        fileEntry.analysisLogs = [...(fileEntry.analysisLogs || []), { level: 'info', message: 'Background analysis completed' }];
        await userDoc.save();
        console.log(`[Worker] Completed advanced analysis for user=${userId} file=${fileId}`);

        if (heartbeat) clearInterval(heartbeat);
        if (process && process.send) {
            process.send({ status: 'ok' });
        }
    } catch (err) {
        if (heartbeat) clearInterval(heartbeat);
        console.error(`[Worker] Error in advanced analysis for user=${userId} file=${fileId}:`, err);
        try {
            const userDoc = await UserFile.findOne({ userId });
            if (userDoc) {
                const fileEntry = userDoc.files.id(fileId);
                if (fileEntry) {
                    fileEntry.analysisStatus = 'failed';
                    fileEntry.advancedAnalysisError = err?.message || 'Background analysis failed';
                    fileEntry.analysisLogs = [...(fileEntry.analysisLogs || []), { level: 'error', message: `Background analysis failed: ${fileEntry.advancedAnalysisError}` }];
                    await userDoc.save();
                }
            }
        } catch (_) {
            // ignore secondary errors
        }
        if (process && process.send) {
            process.send({ status: 'error', error: err?.message });
        }
    }
}

process.on('message', async (msg) => {
    if (!msg) return;
    await runAdvancedAnalysis(msg);
});

// Allow running directly (useful for debugging)
if (require.main === module) {
    const [userId, fileId, fileCategory] = process.argv.slice(2);
    runAdvancedAnalysis({ userId, fileId, fileCategory }).then(() => process.exit(0)).catch(() => process.exit(1));
} 