const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT;

const bot = new TelegramBot(token, { polling: true });

// Map to store exam status for each user
const userStates = new Map();

// Command handling
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!userStates.has(chatId)) {
        // If user is new, initialize their state
        userStates.set(chatId, { examInProgress: false });
    }

    const userState = userStates.get(chatId);

    if (!userState.examInProgress) {
        // Start the exam if not already in progress
        userState.examInProgress = true;
        // Your code to start the exam...
    } else {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    }
});

// Other event handlers and logic...

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
