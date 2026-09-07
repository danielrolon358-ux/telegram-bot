const https = require('https');

// Helper function to send messages back via Telegram API
function sendMessage(chatId, text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const data = JSON.stringify({
        chat_id: chatId,
        text: text
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        res.on('data', () => {});
    });

    req.on('error', (error) => {
        console.error('Error sending message:', error);
    });

    req.write(data);
    req.end();
}

// Netlify serverless function handler
exports.handler = async (event) => {
    // Only accept POST requests from Telegram webhooks
    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'Bot is active and running!' };
    }

    try {
        const update = JSON.parse(event.body);

        // Check if the update contains a message
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const messageText = update.message.text;

            // Simple response router
            if (messageText === '/start') {
                sendMessage(chatId, 'Welcome! Your Telegram bot is successfully deployed on Netlify. Type /pay to test Telegram Stars.');
            } else if (messageText === '/pay') {
                // Here is where you will trigger your Telegram Stars invoice
                sendMessage(chatId, 'Telegram Stars payment integration initialized.');
            } else {
                sendMessage(chatId, `You said: ${messageText}`);
            }
        }

        return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
    } catch (error) {
        console.error('Webhook processing error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};