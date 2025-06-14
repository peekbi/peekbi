const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const UserFile = require('../model/fileModel');
const s3Client = require('../utils/s3Client');
const dfd = require("danfojs-node");
const streamToBuffer = require('../utils/streamToBuffer');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');
const analysis = require('../analysis');
const BUCKET_NAME = 'peekbi-usersfiles'; // One bucket for all users
// 🚀 Upload File (Excel ➝ Clean JSON ➝ Encrypt ➝ Upload)

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
            category,
            uploadedAt: new Date(),
        });

        await userDoc.save();

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
        const userDoc = await UserFile.findOne({ userId });
        if (!userDoc) return res.status(404).json({ error: 'User not found' });

        const fileEntry = userDoc.files.find(f => f._id.toString() === fileId);
        if (!fileEntry) return res.status(404).json({ error: 'File not found' });

        const fileCategory = fileEntry.fileCategory || fileEntry.category;
        if (!fileCategory) return res.status(400).json({ error: 'File category is required' });

        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const encryptedBuffer = await streamToBuffer(s3Response.Body);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);
        const jsonData = JSON.parse(decryptedBuffer.toString());

        const df = new dfd.DataFrame(jsonData);
        const summary = analysis.analyzeOverallStats(df);
        const insights = analysis.getInsightsByCategory(df, fileCategory);

        fileEntry.downloadCount = (fileEntry.downloadCount || 0) + 1;
        fileEntry.analysis = { summary, insights };
        fileEntry.uploadedAt = new Date();
        await userDoc.save();

        return res.status(200).json({
            success: true,
            message: 'Analysis performed successfully.',
            summary,
            insights,
        });

    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Error performing analysis' });
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

exports.getFileAnalysis = async (req, res) => {
    const { userId, fileId } = req.params;

    const userDoc = await UserFile.findOne({ userId });
    if (!userDoc) return res.status(404).json({ error: 'User not found' });

    const fileEntry = userDoc.files.find(f => f._id.toString() === fileId);
    if (!fileEntry) return res.status(404).json({ error: 'File not found' });

    if (!fileEntry.analysisS3Key) {
        return res.status(404).json({ error: 'Full analysis not available for this file.' });
    }

    try {
        const s3Response = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileEntry.analysisS3Key,
        }));

        const buffer = await streamToBuffer(s3Response.Body);
        const fullAnalysis = JSON.parse(buffer.toString());

        res.json({ fullAnalysis });
    } catch (err) {
        console.error('Error retrieving full analysis from S3:', err);
        res.status(500).json({ error: 'Failed to fetch analysis from S3' });
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
        });
    } catch (err) {
        console.error('Error fetching analysis:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

