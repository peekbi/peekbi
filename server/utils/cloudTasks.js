const { v2: { CloudTasksClient } } = require('@google-cloud/tasks');

async function enqueueAdvancedAnalysisTask({ projectId, location, queue, url, token, payload }) {
    const client = new CloudTasksClient();
    const parent = client.queuePath(projectId, location, queue);

    const httpRequest = {
        httpMethod: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json',
            'X-Task-Token': token,
        },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    };

    const task = { httpRequest };

    const request = { parent, task };
    const [response] = await client.createTask(request);
    return response;
}

module.exports = { enqueueAdvancedAnalysisTask }; 