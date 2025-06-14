const express = require('express');
const env = require('dotenv');
env.config();
const cors = require('cors');
const userRouter = require('./router/userRouter');
const adminRouter = require('./router/adminRouter');
const subscriptionRouter = require('./router/subscriptionRouter');
const planRouter = require('./router/planRoutes');
const fileRoutes = require('./router/fileRoutes');
const db = require('./config/db');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Add this middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json()); // Also needed for JSON payloads
// Configure CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://servs.ufdevs.me', 'http://localhost:5174', 'http://localhost:5173', 'https://servs.ufdevs.me/login', 'https://ufdevs.me', 'https://www.peekbi.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));
// Global error handler for multer and custom errors
app.use((err, req, res, next) => {
    // Multer file too large
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5 MB limit.' });
    }

    // Custom file type error (from your fileFilter)
    if (err.message === 'Only Excel files are allowed') {
        return res.status(400).json({ error: err.message });
    }

    // Other unexpected errors
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
});

app.get('/', (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "API is healthy",
        timestamp: new Date().toISOString(),
        project: {
            name: "Peek BI",
            version: "1.0.0",
            description: "PRODUCTION READY SCALABLE BI SOLUTION",
            license: "MIT",

        },
        fileEndPoints: {
            upload: {
                methoda: 'POST',
                endpoint: '/files/upload/:userId',
                body: {
                    key: "file",
                    description: "Excel file to upload",
                    value: "File should be in .xls, .xlsx or .csv format",
                },
            },
            download: {
                methoda: 'GET',
                endpoint: '/files/download/:userId/:fileId',
                body: {
                    key: "file",
                    description: "Excel file to upload",
                    value: "File should be in .xls, .xlsx or .csv format",
                },
            },
            all: {
                methoda: 'GET',
                endpoint: '/files/all/:userId',
            }
        },
        develpedBy: {
            by: "Ramesh Vishwakarma & Team",
            company: "UNFILTER DEVELOPERS (ufdevs.me)",
            website: "https://ufdevs.me",
            contact: "7666893227"
        }
    });
});

app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/subscription', subscriptionRouter);
app.use('/plan', planRouter);
app.use('/files', fileRoutes);


// for local testing
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
// for vercel 
module.exports = app;