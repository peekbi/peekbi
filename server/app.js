const express = require('express');
const env = require('dotenv');
env.config();
const cors = require('cors');
const userRouter = require('./router/userRouter');
const adminRouter = require('./router/adminRouter');
const subscriptionRouter = require('./router/subscriptionRouter');
const planRouter = require('./router/planRoutes');
const fileRoutes = require('./router/fileRoutes');
const testimionialRoutes = require('./router/testimonialRoutes');
const db = require('./config/db');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Configure CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5174',
    'http://localhost:5173',
    'https://servs.ufdevs.me',
    'https://peekbiforntend.vercel.app',
    'https://ufdevs.me',
    'https://www.peekbi.com',
    process.env.FRONTEND_URL // Add your Render frontend URL here
].filter(Boolean); // Remove any undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// Global error handler for multer and custom errors
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5 MB limit.' });
    }

    if (err.message === 'Only Excel files are allowed') {
        return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({
        error: 'Something went wrong',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
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

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/subscribe', subscriptionRouter);
app.use('/plan', planRouter);
app.use('/files', fileRoutes);
app.use('/testimonials', testimionialRoutes);

// Cloud Tasks routes
const taskRoutes = require('./router/taskRoutes');
app.use('/tasks', taskRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Cloud Run Service URL: ${process.env.CLOUD_RUN_SERVICE_URL || 'Not set'}`);
    console.log(`Background tasks: ${process.env.CLOUD_RUN_SERVICE_URL ? 'HTTP-based' : 'Direct processing'}`);
});


module.exports = app;