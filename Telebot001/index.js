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
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Dictionary to store exam status for each user
const examStatus = {};

// Dictionary to store user responses
const userResponses = {};

let examInProgress = false; // Variable to track if the exam process is ongoing

// Command handling
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!examStatus[chatId]) { // Check if the user's exam is not in progress
        examStatus[chatId] = true; // Set exam status to true
        userResponses[chatId] = []; // Initialize user responses array
        // Ask for name and surname
        bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın:');
        bot.once('message', (msg) => {
            const fullName = msg.text.split(' ');
            if (fullName.length !== 2) {
                bot.sendMessage(chatId, 'Yanlış yazdınız.');
                // Recursive call to ask for the name again
                askName(chatId);
                return;
            }
          
            // Array to store answers
            const answers = [fullName];

            // Define questions for each subject
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

            // Ask questions sequentially
            askQuestion(chatId, questions, answers);
        });
    } else {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    }
});

// Recursive function to ask questions sequentially
function askQuestion(chatId, questions, answers, index = 0) {
    if (index >= questions.length) {
        // All questions asked, calculate scores and send the result
        const [firstName, lastName] = answers.shift(); // Extracting name from answers
        const englishScore = calculateScore(answers[0], answers[1]);
        const azerbaijaniScore = calculateScore(answers[2], answers[3]);
        const mathScore = calculateMathScore(answers[4], answers[5], answers[6]);
        const totalScore = calculateTotalScore(englishScore, azerbaijaniScore, mathScore);

        bot.sendMessage(chatId, `Ad: ${firstName}\nSoyad: ${lastName}\nSinif: 9\nİngilis dili: ${englishScore.toFixed(2)}\nAzərbaycan dili: ${azerbaijaniScore.toFixed(2)}\nRiyaziyyat: ${mathScore.toFixed(2)}\n\nSizin ümümmi nəticəniz: ${totalScore.toFixed(2)}`);
        delete examStatus[chatId]; // Delete exam status after results are announced
        delete userResponses[chatId]; // Delete user responses after results are announced
        return;
    }

    const { text, maxValue } = questions[index];

    bot.sendMessage(chatId, text);
    bot.once('message', (msg) => {
        const value = parseInt(msg.text);
        if (!validateInput(value, maxValue)) {
            bot.sendMessage(chatId, 'Səhv məlumat daxil etdiniz');
            askQuestion(chatId, questions, answers, index); // Ask the same question again
        } else {
            userResponses[chatId].push(value); // Store user response
            askQuestion(chatId, questions, answers, index + 1); // Ask the next question
        }
    });
}

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
            bot.sendMessage(chatId, 'Yanlış yazdınız.');
            // Recursive call to ask for the name again
            askName(chatId);
            return;
        }

        // Proceed to asking questions if the name is entered correctly
        const answers = [fullName];

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

        // Ask questions sequentially
        askQuestion(chatId, questions, answers);
    });
}

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
