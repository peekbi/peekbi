const express = require('express');
const { fork } = require('child_process');
const path = require('path');

const router = express.Router();

// Cloud Tasks / Pub/Sub handler: POST /tasks/handler
router.post('/handler', async (req, res) => {
    try {
        let payload = null;
        let isPubSub = false;

        // Support Google Pub/Sub push format: { message: { data: base64(JSON) }, subscription: ... }
        if (req.body && req.body.message && req.body.message.data) {
            try {
                const decoded = Buffer.from(req.body.message.data, 'base64').toString('utf8');
                payload = JSON.parse(decoded);
                isPubSub = true;
                console.log('[Tasks] Pub/Sub push received');
            } catch (e) {
                console.error('[Tasks] Invalid Pub/Sub message.data:', e);
                return res.status(400).json({ error: 'Invalid Pub/Sub data' });
            }
        } else {
            // Fallback: direct JSON body (e.g., Cloud Tasks or internal trigger)
            payload = req.body || {};
        }

        // For non-Pub/Sub calls, validate shared token header (X-Task-Token)
        if (!isPubSub) {
            const token = req.header('X-Task-Token');
            const expected = process.env.GCP_TASK_TOKEN || 'peekbi-task';
            if (token !== expected) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        const { userId, fileId, fileCategory } = payload;
        if (!userId || !fileId || !fileCategory) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const workerPath = path.join(__dirname, '..', 'analysis', 'worker', 'advancedAnalysisWorker.js');
        const child = fork(workerPath, [userId, fileId, fileCategory], { detached: true, stdio: 'ignore' });
        child.unref();

        // Acknowledge immediately so Pub/Sub/Tasks can delete the message
        return res.status(204).send();
    } catch (err) {
        console.error('[Tasks] Handler error:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
});

module.exports = router; 