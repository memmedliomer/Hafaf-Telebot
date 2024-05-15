const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const port = 3000;

var users = {};

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Replace the value below with the Telegram token you receive from @BotFather
const token = "5405137319:AAGqugBjHA0QbPIdT6wWdXfn2BSIGT6PV48";  // Bot tokeninizi buraya girin

const bot = new TelegramBot(token, { polling: true });

const commands = ['/start'];

var letnow = {};

const questions = [
    {
        text: 'İngilis dili fənnindən 26 qapalı sualdan düzgün cavablarınızın sayını yazın.',
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

// Function to validate input
function validateInput(value, maxValue) {
    return value >= 0 && value <= maxValue && Number.isInteger(value);
}

// Function to ask for the name again
function askName(chatId) {
    bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın...');
    bot.once('message', (msg) => {
        const fullName = msg.text.split(' ');
        if (fullName.length !== 2) {
            bot.sendMessage(chatId, 'Yanlış yazdınız.Həm adınızı həm də soyadınızı aralarında boşluq olmaqla yenidən yazın:');
            askName(chatId);
        } else {
            users[chatId].push(fullName); // Name is added to the answers
            askQuestion(chatId, questions, 0); // Proceed to asking questions
        }
    });
}

// Recursive function to ask questions sequentially
function askQuestion(chatId, questions, index) {
    if (index >= questions.length) {
        const [firstName, lastName] = users[chatId].shift(); // Extracting name from answers
        const answers = users[chatId];
        const englishScore = calculateScore(answers[0], answers[1]);
        const azerbaijaniScore = calculateScore(answers[2], answers[3]);
        const mathScore = calculateMathScore(answers[4], answers[5], answers[6]);
        const totalScore = calculateTotalScore(englishScore, azerbaijaniScore, mathScore);

        bot.sendMessage(chatId, `Ad: ${firstName}\nSoyad: ${lastName}\nSinif: 9\nİngilis dili: ${englishScore.toFixed(2)}\nAzərbaycan dili: ${azerbaijaniScore.toFixed(2)}\nRiyaziyyat: ${mathScore.toFixed(2)}\n\nSizin ümümmi nəticəniz: ${totalScore.toFixed(2)}`);
        delete letnow[chatId];
        delete users[chatId];
        return;
    }

    const { text, maxValue } = questions[index];

    bot.sendMessage(chatId, text);
    bot.once('message', (msg) => {
        const value = parseInt(msg.text);
        if (!validateInput(value, maxValue)) {
            bot.sendMessage(chatId, 'Səhv məlumat daxil etdiniz');
            askQuestion(chatId, questions, index); // Ask the same question again
        } else {
            users[chatId].push(value); // Update the answer only if it is correct
            askQuestion(chatId, questions, index + 1); // Ask the next question
        }
    });
}

// Command handling
bot.onText(/\/start/, (msg) => {
    var chatId = msg.chat.id;
    if (!letnow[chatId]) { // Check if the user's exam is not in progress
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
    return;
});

// Listen for button "9" or "11" press
bot.on('message', (msg) => {
    let chatId = msg.chat.id;
    if (msg.text == '9' && letnow[msg.chat.id] === undefined) {
        letnow[chatId] = true;
        users[chatId] = [];
        askName(chatId); // Ask for name and surname
    } else if (msg.text == '11' && letnow[msg.chat.id] === undefined) {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    } else if (msg.text == '/start') {
        delete users[chatId];
        delete letnow[chatId];
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
