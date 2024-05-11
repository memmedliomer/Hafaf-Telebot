const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT;

const bot = new TelegramBot(token, { polling: true });

// Map to store exam status and user responses
const userStates = new Map();

// Command handling
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!userStates.has(chatId) || !userStates.get(chatId).inProgress) {
        userStates.set(chatId, { inProgress: true, currentQuestion: 0, answers: [] });
        // Ask for name and surname
        bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın:');
    } else {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    }
});

// Listen for user responses
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userState = userStates.get(chatId);

    if (userState && userState.inProgress) {
        const answer = parseInt(msg.text);
        if (!isNaN(answer)) {
            userState.answers.push(answer);
            userState.currentQuestion++;
        } else {
            bot.sendMessage(chatId, 'Zəhmət olmasa, yalnız rəqəm daxil edin.');
            return;
        }
    }

    switch (userState.currentQuestion) {
        case 0:
            // Ask the first question
            bot.sendMessage(chatId, 'İngilis dili fənnindən 26 qapalı sualdan düzgün cavablarınızın sayını yazın.');
            break;
        case 1:
            // Ask the second question
            bot.sendMessage(chatId, 'İngilis dili fənnindən 4 açıq sualdan düzgün cavablarınızın sayını yazın.');
            break;
        // Add cases for other questions
        default:
            // All questions answered, calculate scores
            // Reset user state
            userStates.delete(chatId);
            break;
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
