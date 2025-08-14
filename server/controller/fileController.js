const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const UserFile = require('../model/fileModel');
const s3Client = require('../utils/s3Client');
const dfd = require("danfojs-node");
const streamToBuffer = require('../utils/streamToBuffer');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');
const analysis = require('../analysis');
const BUCKET_NAME = 'peekbi-usersfiles'; // One bucket for all users
const { fork } = require('child_process');
const path = require('path');
// 🚀 Upload File (Excel ➝ Clean JSON ➝ Encrypt ➝ Upload);

// Lightweight basic insights for large datasets
function computeBasicInsights(df) {
    const totalRecords = df.shape[0];
    const columns = df.columns || [];

    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    const salesAliases = ['total','amount','sales','sale','revenue','grosssale','netsale','invoicevalue','totalsales','salesamount','totalrevenue'];
    const categoryAliases = ['category','product','item','brand','segment','subcategory','productname'];
    const dateAliases = ['date','orderdate','timestamp','saledate','datetime','transactiondate'];

    const findCol = (aliases) => {
        const normCols = columns.map(c => ({ o: c, n: normalize(c) }));
        for (const alias of aliases) {
            const a = normalize(alias);
            const exact = normCols.find(c => c.n === a);
            if (exact) return exact.o;
        }
        for (const alias of aliases) {
            const a = normalize(alias);
            const partial = normCols.find(c => c.n.includes(a) || a.includes(c.n));
            if (partial) return partial.o;
        }
        return undefined;
    };

    const salesCol = findCol(salesAliases);
    const categoryCol = findCol(categoryAliases);
    const dateCol = findCol(dateAliases);

    const num = (v) => {
        const t = String(v ?? '').replace(/[^0-9.-]/g, '');
        const p = parseFloat(t);
        return isNaN(p) ? 0 : p;
    };

    const basic = { total_records: totalRecords };

    if (dateCol) {
        try {
            const dates = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d));
            if (dates.length > 1) {
                const min = new Date(Math.min(...dates));
                const max = new Date(Math.max(...dates));
                basic.date_range = {
                    start: min.toISOString(),
                    end: max.toISOString(),
                    days: Math.max(1, Math.round((max - min) / (1000 * 60 * 60 * 24)))
                };
            }
        } catch {}
    }

    if (salesCol) {
        const salesVals = df[salesCol].values.map(num);
        const totalSales = salesVals.reduce((a, b) => a + b, 0);
        const avgSales = salesVals.length ? totalSales / salesVals.length : 0;
        basic.kpis = {
            total_sales: Number(totalSales.toFixed(2)),
            avg_sales: Number(avgSales.toFixed(2)),
            transactions: salesVals.length,
        };
    }

    if (salesCol && categoryCol) {
        const map = {};
        for (let i = 0; i < totalRecords; i++) {
            const cat = df[categoryCol].values[i];
            const sale = num(df[salesCol].values[i]);
            if (cat === undefined || cat === null) continue;
            const key = String(cat);
            map[key] = (map[key] || 0) + sale;
        }
        const list = Object.entries(map)
            .map(([k, v]) => ({ [categoryCol]: k, [salesCol]: Number(v.toFixed(2)) }))
            .sort((a, b) => b[salesCol] - a[salesCol]);
        basic.top_categories = list.slice(0, 5);
    }

    return basic;
}

exports.uploadFile = async (req, res) => {
    const userId = req.params.userId;
    const category = req.body.category || 'General';
    const { originalname, mimetype, size, buffer } = req.file;

    try {
        const rawData = analysis.parseExcelBuffer(buffer);
        const df = analysis.cleanData(rawData);
        const json = dfd.toJSON(df, { format: 'row' }); // Clean JSON
        const jsonBuffer = Buffer.from(JSON.stringify(json));
        const encryptedBuffer = encryptBuffer(jsonBuffer);

        const timestamp = Date.now();
        const s3Key = `users/${userId}/${timestamp}-${originalname}`;
        const analysisS3Key = `users/${userId}/analysis/${timestamp}-analysis.json`;

        let userDoc = await UserFile.findOne({ userId });
        if (!userDoc) {
            userDoc = await UserFile.create({
                userId,
                s3Bucket: BUCKET_NAME,
                files: [],
            });
        }

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: analysisS3Key,
            Body: encryptedBuffer,
            ContentType: 'application/json',
        }));

        userDoc.files.push({
            originalName: originalname,
            s3Key,
            analysisS3Key,
            mimeType: mimetype,
            sizeInBytes: size,
            fileCategory: category,
            uploadedAt: new Date(),
        });

        await userDoc.save();
        // ✅ Increment usage count if usage tracking is attached by middleware
        if (req.planUsage && req.planUsage.featureKey === 'uploads') {
            const { usage } = req.planUsage;
            usage.uploads = (usage.uploads || 0) + 1;
            await usage.save();
        }
        res.status(200).json({
            success: true,
            message: 'File uploaded and processed successfully.',
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'File upload failed.' });
    }
};

// ⚡ Perform Analysis (Download JSON ➝ Decrypt ➝ Analyze)
exports.performAnalysis = async (req, res) => {
    const { userId, fileId } = req.params;

    try {
        console.log(`[Analysis] ▶︎ Request received | userId=${userId} fileId=${fileId}`);
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) {
            console.log(`[Analysis] ✖ user not found | userId=${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const fileEntry = userDoc.files.find(f => f._id.toString() === fileId);
        if (!fileEntry) {
            console.log(`[Analysis] ✖ file not found | fileId=${fileId}`);
            return res.status(404).json({ error: 'File not found' });
        }

        const fileCategory = fileEntry.fileCategory || fileEntry.category;
        if (!fileCategory) {
            console.log(`[Analysis] ✖ category missing | fileId=${fileId}`);
            return res.status(400).json({ error: 'File category is required' });
        }

        console.log(`[Analysis] ⬇ Fetching encrypted JSON from S3 | key=${fileEntry.analysisS3Key}`);
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const t0 = Date.now();
        const encryptedBuffer = await streamToBuffer(s3Response.Body);
        console.log(`[Analysis] ✅ Downloaded from S3 (${encryptedBuffer.length} bytes) in ${Date.now() - t0}ms`);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        console.log(`[Analysis] 🔓 Decrypted buffer (${decryptedBuffer.length} bytes)`);
        const jsonData = JSON.parse(decryptedBuffer.toString());
        console.log(`[Analysis] 🧾 Parsed JSON records=${Array.isArray(jsonData) ? jsonData.length : 0}`);

        const df = new dfd.DataFrame(jsonData);
        const totalRows = df.shape[0];
        const totalCols = df.shape[1];
        console.log(`[Analysis] 🧮 DataFrame shape rows=${totalRows} cols=${totalCols} category=${fileCategory}`);

        // If rows <= 5000, compute full insights synchronously (preserve current behavior)
        if (totalRows <= 5000) {
            console.log(`[Analysis] ≤5000 rows → computing full insights inline`);
            const t1 = Date.now();
            console.log('[Analysis] ▶︎ analyzeOverallStats:start');
            const summary = analysis.analyzeOverallStats(df);
            console.log(`[Analysis] ◀︎ analyzeOverallStats:done in ${Date.now() - t1}ms`);
            const t2 = Date.now();
            console.log('[Analysis] ▶︎ getInsightsByCategory:start');
            const insights = analysis.getInsightsByCategory(df, fileCategory);
            console.log(`[Analysis] ◀︎ getInsightsByCategory:done in ${Date.now() - t2}ms`);
            const t3 = Date.now();
            console.log(`[Analysis] ✅ Path total ${t3 - t0}ms`);

            fileEntry.downloadCount = (fileEntry.downloadCount || 0) + 1;
            fileEntry.analysis = { summary, insights };
            fileEntry.uploadedAt = new Date();
            fileEntry.analysisStatus = 'advanced_ready';
            fileEntry.advancedAnalysisCompletedAt = new Date();
            fileEntry.analysisLogs = [...(fileEntry.analysisLogs || []), { level: 'info', message: 'Full analysis completed synchronously (<=3000 rows)' }];
            await userDoc.save();
            console.log(`[Analysis] 💾 Saved full insights to DB | userId=${userId} fileId=${fileId}`);
            // ✅ Increment usage count if usage tracking is attached by middleware
            if (req.planUsage && req.planUsage.featureKey === 'analyse') {
                const { usage } = req.planUsage;
                usage.analyse = (usage.analyse || 0) + 1;
                await usage.save();
            }
            return res.status(200).json({
                success: true,
                message: 'Analysis performed successfully.',
                rawData: jsonData,
                analysis: { summary, insights },
                analysisStatus: fileEntry.analysisStatus,
            });
        }

        // For large datasets (> 3000 rows): compute preview insights on first 3000 rows
        console.log(`[Analysis] >5000 rows → computing preview on first 3000 rows and enqueueing background job`);
        const dfPreview = df.head(5000);
        const memStart = process.memoryUsage().rss / (1024 * 1024);
        console.log(`[Analysis] 💽 Memory before preview: ${memStart.toFixed(1)} MB`);
        const p1 = Date.now();
        console.log('[Analysis] ▶︎ analyzeOverallStats(3k):start');
        const summary = analysis.analyzeOverallStats(dfPreview);
        console.log(`[Analysis] ◀︎ analyzeOverallStats(3k):done in ${Date.now() - p1}ms`);
        const p2 = Date.now();
        console.log('[Analysis] ▶︎ getInsightsByCategory(3k):start');
        const previewInsights = analysis.getInsightsByCategory(dfPreview, fileCategory);
        console.log(`[Analysis] ◀︎ getInsightsByCategory(3k):done in ${Date.now() - p2}ms`);
        const p3 = Date.now();
        const memAfter = process.memoryUsage().rss / (1024 * 1024);
        console.log(`[Analysis] 💽 Memory after preview: ${memAfter.toFixed(1)} MB (Δ ${(memAfter - memStart).toFixed(1)} MB)`);
        console.log(`[Analysis] ✅ Preview total ${p3 - p1}ms`);

        // Estimate full analysis time based on preview throughput
        const insightMs = Math.max(1, Date.now() - p2);
        const rowsPerSec = 5000 / (insightMs / 1000);
        const estTotalSec = Math.round(totalRows / rowsPerSec);
        const estRemainingSec = Math.max(0, estTotalSec - Math.round(5000 / rowsPerSec));
        const etaMsg = `Estimated full analysis ~ ${Math.floor(estRemainingSec / 60)}m ${Math.round(estRemainingSec % 60)}s (throughput ~ ${rowsPerSec.toFixed(1)} rows/sec, totalRows=${totalRows})`;
        console.log(`[Analysis] ⏳ ${etaMsg}`);

        fileEntry.analysis = { summary, insights: previewInsights };
        fileEntry.analysisStatus = 'advanced_queued';
        fileEntry.advancedAnalysisQueuedAt = new Date();
        fileEntry.analysisLogs = [
            ...(fileEntry.analysisLogs || []),
            { level: 'info', message: 'Advanced analysis queued (preview computed for first 5000 rows)' },
            { level: 'info', message: etaMsg }
        ];
        try {
            await userDoc.save();
        } catch (err) {
            if (err && err.name === 'VersionError') {
                console.warn(`[Analysis] ⚠ Version conflict when saving preview. Retrying with fresh doc | userId=${userId} fileId=${fileId}`);
                const freshDoc = await UserFile.findOne({ userId });
                if (freshDoc) {
                    const freshFile = freshDoc.files.id(fileId);
                    if (freshFile) {
                        freshFile.analysis = { summary, insights: previewInsights };
                        freshFile.analysisStatus = 'advanced_queued';
                        freshFile.advancedAnalysisQueuedAt = new Date();
                        freshFile.analysisLogs = [...(freshFile.analysisLogs || []), { level: 'info', message: 'Advanced analysis queued (preview computed for first 3000 rows) [retry]' }, { level: 'info', message: etaMsg }];
                        await freshDoc.save();
                    }
                }
            } else {
                throw err;
            }
        }
        console.log(`[Analysis] 💾 Saved preview insights & queued status to DB | userId=${userId} fileId=${fileId}`);

        // Background execution via Cloud Tasks (optional) or local worker fallback
        if (process.env.USE_CLOUD_TASKS === 'true') {
            try {
                console.log('[Analysis] ☁ Enqueueing Cloud Task');
                // Lazy import to avoid hard dependency when not enabled
                const { enqueueAdvancedAnalysisTask } = require('../utils/cloudTasks');
                const taskResp = await enqueueAdvancedAnalysisTask({
                    projectId: process.env.GCP_PROJECT_ID,
                    location: process.env.GCP_LOCATION,
                    queue: process.env.GCP_TASK_QUEUE,
                    url: process.env.GCP_TASK_HANDLER_URL, // must point to an internal endpoint that triggers full analysis
                    token: process.env.GCP_TASK_TOKEN || 'peekbi-task',
                    payload: { userId, fileId, fileCategory }
                });
                console.log('[Analysis] ☁ Cloud Task enqueued:', taskResp.name);
                fileEntry.analysisLogs = [...(fileEntry.analysisLogs || []), { level: 'info', message: `Cloud Task enqueued: ${taskResp.name}` }];
                await userDoc.save();
            } catch (taskErr) {
                console.error('[Analysis] ☁ Cloud Task enqueue failed, falling back to local worker:', taskErr);
                // Fall back to local worker
                const workerPath = path.join(__dirname, '..', 'analysis', 'worker', 'advancedAnalysisWorker.js');
                const child = fork(workerPath, [userId, fileId, fileCategory], { detached: true, stdio: 'ignore' });
                console.log(`[Analysis] 🚀 Forked worker pid=${child.pid} for full analysis (fallback) | userId=${userId} fileId=${fileId}`);
                child.unref();
            }
        } else {
            // Local worker
            const workerPath = path.join(__dirname, '..', 'analysis', 'worker', 'advancedAnalysisWorker.js');
            const child = fork(workerPath, [userId, fileId, fileCategory], { detached: true, stdio: 'ignore' });
            console.log(`[Analysis] 🚀 Forked worker pid=${child.pid} for full analysis | userId=${userId} fileId=${fileId}`);
            child.unref();
        }

        // Respond immediately with preview insights as final success (hide background status)
        if (req.planUsage && req.planUsage.featureKey === 'analyse') {
            const { usage } = req.planUsage;
            usage.analyse = (usage.analyse || 0) + 1;
            await usage.save();
        }
        console.log(`[Analysis] ↩ Returning 200 with preview insights (background hidden) | userId=${userId} fileId=${fileId}`);
        return res.status(200).json({
            success: true,
            message: 'Analysis performed successfully.',
            rawData: jsonData,
            analysis: { summary, insights: previewInsights }
        });

    } catch (error) {
        console.error('[Analysis] ✖ Error performing analysis:', error);
        res.status(500).json({ error: 'Error performing analysis' });
    }
};

// 🔍 Extract Raw Data (Download JSON ➝ Decrypt ➝ Return)
exports.extractRawData = async (req, res) => {
    const { userId, fileId } = req.params;

    try {
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) return res.status(404).json({ error: 'User not found' });

        const fileEntry = userDoc.files.find(f => f._id.toString() === fileId);
        if (!fileEntry) return res.status(404).json({ error: 'File not found' });

        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const encryptedBuffer = await streamToBuffer(s3Response.Body);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        const jsonData = JSON.parse(decryptedBuffer.toString());
        // ✅ Increment usage count if usage tracking is attached by middleware
        if (req.planUsage && req.planUsage.featureKey === 'download') {
            const { usage } = req.planUsage;
            usage.download = (usage.download || 0) + 1;
            await usage.save();
        }
        return res.status(200).json({
            success: true,
            message: 'Raw data extracted successfully.',
            rawData: jsonData,
        });

    } catch (error) {
        console.error('Raw Data Extraction Error:', error);
        res.status(500).json({ error: 'Error extracting raw data' });
    }
};


exports.getAllFiles = async (req, res) => {
    const userId = req.params.userId;
    const userDoc = await UserFile.findOne({ userId });
    if (!userDoc) return res.json({ files: [] });
    res.json({ files: userDoc.files });
};


exports.downloadUserFile = async (req, res) => {
    const { userId, fileId } = req.params;

    const userDoc = await UserFile.findOne({ userId });
    if (!userDoc) return res.status(404).json({ error: 'User not found' });

    const fileEntry = userDoc.files.find(f => f._id.toString() === fileId);
    if (!fileEntry) return res.status(404).json({ error: 'File not found' });

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileEntry.s3Key,
    });

    try {
        const s3Response = await s3Client.send(command);

        const chunks = [];
        s3Response.Body.on('data', (chunk) => chunks.push(chunk));
        s3Response.Body.on('end', () => {
            const encryptedBuffer = Buffer.concat(chunks);
            const decryptedBuffer = decryptBuffer(encryptedBuffer);
            const analysisResult = analyzeExcel(decryptedBuffer);
            const insights = runAnalysis(analysisResult);

            fileEntry.downloadCount = (fileEntry.downloadCount || 0) + 1;
            fileEntry.analysis = insights
            try {
                userDoc.save();
            } catch (error) {
                console.error('Error saving userDoc:', error);
                // Handle error or throw
            }
            res.setHeader('Content-Disposition', `attachment; filename="${fileEntry.originalName}"`);
            res.setHeader('Content-Type', fileEntry.mimetype || 'application/octet-stream');
            res.send(insights);

        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Error downloading or decrypting the file' });
    }
};

exports.getFileAnalysisById = async (req, res) => {
    const { userId, fileId } = req.params;

    try {
        const userDoc = await UserFile.findOne({ userId });

        if (!userDoc) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const file = userDoc.files.id(fileId); // Mongoose subdocument accessor

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found.' });
        }

        const { summary, insights } = file.analysis || {};

        res.status(200).json({
            success: true,
            fileId,
            summary,
            insights,
            category: file.fileCategory || 'General',
            analysisStatus: file.analysisStatus || 'none',
            advancedAnalysisQueuedAt: file.advancedAnalysisQueuedAt,
            advancedAnalysisCompletedAt: file.advancedAnalysisCompletedAt,
            advancedAnalysisError: file.advancedAnalysisError,
            analysisLogs: file.analysisLogs || [],
        });
    } catch (err) {
        console.error('Error fetching analysis:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.incrementAIPromptUsage = async (req, res) => {
    try {
        const { usage, featureKey } = req.planUsage || {};

        if (!usage || featureKey !== 'aiPromts') {
            return res.status(400).json({ message: 'Invalid usage tracking setup.' });
        }
        // 🚀 Place your AI logic here (e.g., send to OpenAI)
        // ✅ Increment usage count
        usage[featureKey] = (usage[featureKey] || 0) + 1;
        await usage.save();

        return res.status(200).json({ message: 'AI prompt used successfully', usage: usage[featureKey] });
    } catch (err) {
        console.error("AI Prompt Controller Error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
};