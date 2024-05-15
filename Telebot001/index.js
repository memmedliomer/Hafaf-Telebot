const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const port = 3000;

var users = {}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Replace the value below with the Telegram token you receive from @BotFather
const token = "7189509884:AAH4tb1tilcmBOVQ5ad7O6tSj0EuISwbc5g";

const bot = new TelegramBot(token, { polling: true });

const commands = ['/start']

var letnow = {}

const questions = [
    {
        text: 'İngilis dili fənnindən 26 qapalı sualdan düzgün cavablarınızın sayını  yazın.',
        maxValue: 26
    },
    {
        text: 'İngilis dili fənnindən 4 açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 4
    },
    {
        text: 'Azərbaycan dili fənnindən 26 qapalı sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 26
    },
    {
        text: 'Azərbaycan dili fənnindən 4 açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 4
    },
    {
        text: 'Riyaziyyat fənnindən 15 qapalı sualdan doğru olanların sayını yazın.',
        maxValue: 15
    },
    {
        text: 'Riyaziyyat fənnindən 6 açıq kodlaşdırıla bilən sualdan doğru olanların sayını yazın.',
        maxValue: 6
    },
    {
        text: 'Riyaziyyat fənnindən 4 tam açıq sualdan doğru olanların sayını yazın.',
        maxValue: 4
    }
];

// Dictionary to store exam status for each user
var examStatus = {};

// Command handling
bot.onText(/\/start/, (msg) => {
    var chatId = msg.chat.id;
    if (!examStatus[chatId]) { // Check if the user's exam is not in progress
        bot.sendMessage(chatId, 'Salam. Hədəf Steam Liseyinin balabilgəsi Ömər Məmmədlinin DIM imtahan nəticənizi hesablamaq üçün düzəltdiyi bota xoş gəldiniz!\n\nZəhmət olmasa menyudan sinifinizi seçin...', {
            reply_markup: {
                keyboard: [
                    [{ text: '9' }, { text: '11' }]
                ],
                resize_keyboard: true
            }
        });
    } else {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    }
    return
}
);





// Function to calculate English score
function calculateScore(closedQuestions, openQuestions) {
    return (((openQuestions * 2) + closedQuestions) * 100) / 34;
}

// Function to calculate Mathematics score
function calculateMathScore(nQ, nAK, nA) {
    return (((nA * 2) + nAK + nQ) * 100) / 29;
}

// Function to calculate total score
function calculateTotalScore(englishScore, azerbaijaniScore, mathScore) {
    return englishScore + azerbaijaniScore + mathScore;
}

// Recursive function to ask questions sequentially

// Function to validate input
function validateInput(value, maxValue) {
    return value >= 0 && value <= maxValue && Number.isInteger(value);
}

// Function to validate name and surname
function validateNameSurname(input) {
    const parts = input.trim().split(/\s+/);
    return parts.length === 2 && parts[0] && parts[1];
}

bot.on('message', (msg) => {
    let chatId = msg.chat.id;

    if (msg.text == '9' && letnow[chatId] === undefined) {
        bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın.');
        letnow[chatId] = [0, 9]; // Stage 0 indicates asking for name and surname
        users[chatId] = { answers: [] }; // Initialize user's data structure
    } else if (msg.text == '11' && letnow[chatId] === undefined) {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    } else {
        if (msg.text == '/start') {
            delete users[chatId];
            delete letnow[chatId];
        } else {
            let stage = letnow[chatId][0];

            if (stage === 0) { // Asking for name and surname
                if (validateNameSurname(msg.text)) {
                    users[chatId].nameSurname = msg.text.trim();
                    bot.sendMessage(chatId, questions[0].text);
                    letnow[chatId][0] = 1; // Move to next stage
                } else {
                    bot.sendMessage(chatId, 'Zəhmət olmasa həm adınızı, həm də soyadınızı arada boşluq olmaqla yazın.');
                }
            } else {
                let quiz = letnow[chatId];
                let num = parseInt(msg.text);

                if (commands.indexOf(num) == -1) {
                    if (quiz[1] == 9 && questions[quiz[0] - 1].maxValue >= num) {
                        users[chatId].answers.push(num);

                        if (quiz[0] == 7) {
                            delete letnow[chatId];
                            const a = users[chatId].answers;
                            const az = calculateScore(a[0], a[1]).toFixed(2);
                            const eng = calculateScore(a[2], a[3]).toFixed(2);
                            const math = calculateMathScore(a[4], a[5], a[6]).toFixed(2);
                            const total = calculateTotalScore(az, eng, math);
                            const nameSurname = users[chatId].nameSurname;

                            bot.sendMessage(chatId, `${nameSurname}\nİngilis dili: ${eng}\nAzərbaycan dili: ${az}\nRiyaziyyat: ${math}\n\nSizin ümumi nəticəniz: ${parseInt(total)}bal`);
                            delete users[chatId];
                            return;
                        }
                        bot.sendMessage(chatId, questions[quiz[0]].text);
                        letnow[chatId][0] = quiz[0] + 1;
                    } else {
                        bot.sendMessage(chatId, "Səhv yazdınız zəhmət olmasa yenidən yazın.");
                    }
                }
            }
        }
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
