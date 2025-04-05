const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// تخزين البوتات
let bots = {};

// معالجة طلبات ويب هوك البوت
app.post('/webhook/:token', async (req, res) => {
    const token = req.params.token;
    const bot = bots[token];
    
    if (!bot) {
        return res.status(404).send('Bot not found');
    }

    const message = req.body.message;
    if (!message) {
        return res.status(400).send('No message provided');
    }

    try {
        await handleBotMessage(bot, message);
        res.send('OK');
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).send('Error handling message');
    }
});

// إضافة بوت جديد
app.post('/api/bots', (req, res) => {
    const botData = req.body;
    bots[botData.token] = botData;
    res.json({ success: true });
});

// الحصول على معلومات البوت
app.get('/api/bots/:token', (req, res) => {
    const bot = bots[req.params.token];
    if (!bot) {
        return res.status(404).send('Bot not found');
    }
    res.json(bot);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 