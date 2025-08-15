const { parentPort, workerData } = require('worker_threads');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');
const UserFile = require('../model/fileModel');
const s3Client = require('../utils/s3Client');
const dfd = require("danfojs-node");
const streamToBuffer = require('../utils/streamToBuffer');
const { decryptBuffer } = require('../utils/encryption');
const analysis = require('../analysis');

// Connect to MongoDB in worker thread
async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Worker] Connected to MongoDB');
    } catch (error) {
        console.error('[Worker] MongoDB connection error:', error);
        throw error;
    }
}

const BUCKET_NAME = 'peekbi-usersfiles';

async function processFullAnalysis() {
    const { userId, fileId, fileCategory } = workerData;
    const startTime = Date.now();

    try {
        console.log(`[Worker] Starting full analysis for user=${userId} file=${fileId}`);

        // Connect to MongoDB first
        await connectToMongoDB();

        // Update status to processing
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) throw new Error('User not found');

        const fileEntry = userDoc.files.id(fileId);
        if (!fileEntry) throw new Error('File not found');

        fileEntry.analysisStatus = 'advanced_queued'; // Keep as queued while processing
        await userDoc.save();

        // Download and decrypt data
        console.log(`[Worker] Downloading data from S3`);
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const encryptedBuffer = await streamToBuffer(s3Response.Body);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        const jsonData = JSON.parse(decryptedBuffer.toString());

        console.log(`[Worker] Processing ${Array.isArray(jsonData) ? jsonData.length : 'unknown'} records`);

        // Create DataFrame and run full analysis
        const df = new dfd.DataFrame(jsonData);
        const summary = analysis.analyzeOverallStats(df);
        const insights = analysis.getInsightsByCategory(df, fileCategory);

        // Save results
        const freshDoc = await UserFile.findOne({ userId });
        const freshFile = freshDoc.files.id(fileId);

        freshFile.analysis = { summary, insights };
        freshFile.analysisStatus = 'advanced_ready';
        freshFile.advancedAnalysisCompletedAt = new Date();
        freshFile.advancedAnalysisError = undefined;
        // Remove analysisLogs since it's not in the schema

        await freshDoc.save();

        console.log(`[Worker] Completed analysis for ${fileId} in ${Date.now() - startTime}ms`);

        // Send success message back to main thread
        parentPort.postMessage({
            success: true,
            fileId,
            processingTime: Date.now() - startTime
        });

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('[Worker] MongoDB connection closed');

    } catch (error) {
        console.error(`[Worker] Error processing ${fileId}:`, error);

        // Update error status in database
        try {
            const errorDoc = await UserFile.findOne({ userId });
            const errorFile = errorDoc.files.id(fileId);
            if (errorFile) {
                errorFile.analysisStatus = 'failed'; // Use valid enum value
                errorFile.advancedAnalysisError = error.message;
                await errorDoc.save();
            }
        } catch (dbError) {
            console.error(`[Worker] Failed to update error status:`, dbError);
        }

        // Send error message back to main thread
        parentPort.postMessage({
            success: false,
            error: error.message,
            fileId
        });

        // Close MongoDB connection even on error
        try {
            await mongoose.connection.close();
            console.log('[Worker] MongoDB connection closed after error');
        } catch (closeError) {
            console.error('[Worker] Error closing MongoDB connection:', closeError);
        }
    }
}

// Start processing
processFullAnalysis();