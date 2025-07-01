const express = require('express');
const multer = require('multer');
const authorization = require('../middlewares/authMiddleware');
const planMiddleware = require('../middlewares/planMiddleware');
const { uploadFile, getAllFiles, getSignedDownloadUrl, downloadUserFile, getFileAnalysis, getFileAnalysisById, performAnalysis, incrementAIPromptUsage, extractRawData } = require('../controller/fileController');
const router = express.Router();

const upload = require('../middlewares/uploadMiddlware');
// Middleware to simulate user (in real app, use auth middleware)
router.use((req, res, next) => {
    req.user = { _id: 'YOUR_USER_ID_HERE' }; // replace with real user from token/session
    next();
});

// Handle upload errors safely here
router.post('/upload/:userId', authorization, planMiddleware('uploads'), (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size exceeds 5MB.' });
            }
            if (err.message === 'Only Excel files are allowed') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Upload failed.', details: err.message });
        }
        // No multer error, proceed to controller
        return uploadFile(req, res, next);
    });
});
router.get('/all/:userId', authorization, getAllFiles);
router.get('/download/:userId/:fileId', authorization, planMiddleware('analyse'), extractRawData);
router.get('/analyse/:userId/:fileId', authorization, planMiddleware('analyse'), performAnalysis);
router.get('/rawData/:userId/:fileId', authorization, planMiddleware('rawData'), extractRawData);
// You must authenticate user and attach user object to req.user before this
router.post('/promts', authorization, planMiddleware('aiPromts'), incrementAIPromptUsage);



module.exports = router;
