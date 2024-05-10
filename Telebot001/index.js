const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const PORT = process.env.PORT || 3000; // Use the port defined in environment variable or default to 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Replace the value below with the Telegram token you receive from @BotFather
const token =process.env.BOT;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;
    const messageId = msg.message_id;

    // Send the same message back to the user
    const sentMessage = await bot.sendMessage(chatId, userInput);
    console.log("Message sent:", sentMessage.text);
});
