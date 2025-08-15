const express = require('express');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../utils/s3Client');
const { decryptBuffer } = require('../utils/encryption');
const analysis = require('../analysis');
const UserFile = require('../model/fileModel');
const dfd = require("danfojs-node");

const router = express.Router();
const BUCKET_NAME = 'peekbi-usersfiles';

// Background analysis processor - runs full analysis for large datasets
router.post('/process-analysis', async (req, res) => {
    try {
        // Validate internal token
        const token = req.header('X-Internal-Token');
        const expected = process.env.INTERNAL_TOKEN || 'peekbi-internal';
        if (token !== expected) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId, fileId, fileCategory } = req.body;
        if (!userId || !fileId || !fileCategory) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`[Background] Starting full analysis for user=${userId} file=${fileId}`);

        // Acknowledge immediately to avoid timeout
        res.status(202).json({ message: 'Background processing started' });

        // Process in background
        processFullAnalysis(userId, fileId, fileCategory);

    } catch (err) {
        console.error('[Background] Handler error:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
});

async function processFullAnalysis(userId, fileId, fileCategory) {
    const startTime = Date.now();

    try {
        // Keep status as advanced_queued during processing
        await updateFileStatus(userId, fileId, 'advanced_queued', 'Full analysis started');

        // Get file data
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) throw new Error('User not found');

        const fileEntry = userDoc.files.id(fileId);
        if (!fileEntry) throw new Error('File not found');

        // Download and decrypt data
        console.log(`[Background] Downloading data from S3`);
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const chunks = [];
        for await (const chunk of s3Response.Body) {
            chunks.push(chunk);
        }

        const encryptedBuffer = Buffer.concat(chunks);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        const jsonData = JSON.parse(decryptedBuffer.toString());

        console.log(`[Background] Processing ${jsonData.length} records`);

        // Create DataFrame and run full analysis
        const df = new dfd.DataFrame(jsonData);

        // Update progress (keep status as advanced_queued)
        await updateFileStatus(userId, fileId, 'advanced_queued', `Analyzing ${df.shape[0]} records...`);

        const summary = analysis.analyzeOverallStats(df);
        const insights = analysis.getInsightsByCategory(df, fileCategory);

        // Save results
        const freshDoc = await UserFile.findOne({ userId });
        const freshFile = freshDoc.files.id(fileId);

        freshFile.analysis = { summary, insights };
        freshFile.analysisStatus = 'advanced_ready';
        freshFile.advancedAnalysisCompletedAt = new Date();
        freshFile.advancedAnalysisError = undefined;

        await freshDoc.save();

        console.log(`[Background] Completed analysis for ${fileId} in ${Date.now() - startTime}ms`);

    } catch (error) {
        console.error(`[Background] Error processing ${fileId}:`, error);
        await updateFileStatus(userId, fileId, 'failed', `Analysis failed: ${error.message}`, error.message);
    }
}

async function updateFileStatus(userId, fileId, status, message, errorMsg = null) {
    try {
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) return;

        const fileEntry = userDoc.files.id(fileId);
        if (!fileEntry) return;

        fileEntry.analysisStatus = status;
        if (errorMsg) {
            fileEntry.advancedAnalysisError = errorMsg;
        }
        if (message) {
            fileEntry.analysisLogs = [...(fileEntry.analysisLogs || []), {
                level: status === 'failed' ? 'error' : 'info',
                message
            }];
        }

        await userDoc.save();
    } catch (err) {
        console.error('Error updating file status:', err);
    }
}

module.exports = router; 