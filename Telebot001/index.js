const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Bot is alive');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const token = '7189509884:AAH-hZXEW05FZw90ol5enGJQQ1XwOJAbGZo';

const bot = new TelegramBot(token, { polling: true });

const commands = ['/start', '/return', '/clear'];

let users = {};
let messageIds = {};
let letnow = {};

const questions9 = [
    { text: 'İngilis dili fənnindən ümumilikdə 26 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 26 },
    { text: 'İngilis dili fənnindən ümumilikdə 4 açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 4 },
    { text: 'Azərbaycan dili fənnindən ümumilikdə 26 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 26 },
    { text: 'Azərbaycan dili fənnindən ümumilikdə 4 açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 4 },
    { text: 'Riyaziyyat fənnindən 15 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 15 },
    { text: 'Riyaziyyat fənnindən 6 açıq kodlaşdırıla bilən sualdan düzgün cavablarınızın sayını yazın.', maxValue: 6 },
    { text: 'Riyaziyyat fənnindən 4 tam açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 4 }
];

const questions11 = [
    { text: 'Azərbaycan dili fənnindən ümumilikdə 20 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 20 },
    { text: 'Azərbaycan dili fənnindən ümumilikdə 10 açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 10 },
    { text: 'Riyaziyyat fənnindən 13 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 13 },
    { text: 'Riyaziyyat fənnindən 5 açıq kodlaşdırıla bilən sualdan düzgün cavablarınızın sayını yazın.', maxValue: 5 },
    { text: 'Riyaziyyat fənnindən 7 tam açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 7 },
    { text: 'İngilis dili fənnindən ümumilikdə 23 qapalı sualdan düzgün cavablarınızın sayını yazın.', maxValue: 23 },
    { text: 'İngilis dili fənnindən ümumilikdə 7 açıq sualdan düzgün cavablarınızın sayını yazın.', maxValue: 7 }
];

async function sendMessageAndStoreId(chatId, text) {
    try {
        const sentMsg = await bot.sendMessage(chatId, text);
        if (!messageIds[chatId]) {
            messageIds[chatId] = [];
        }
        messageIds[chatId].push(sentMsg.message_id);
    } catch (error) {
        console.error(`Failed to send message to chat ${chatId}:`, error);
    }
}

function validateInput(value, maxValue) {
    return value >= 0 && value <= maxValue;
}

function validateNameSurname(input) {
    const parts = input.trim().split(/\s+/);
    return parts.length === 2 && parts[0] && parts[1];
}

async function clearChatHistory(chatId) {
    if (messageIds[chatId]) {
        for (const messageId of messageIds[chatId]) {
            try {
                await bot.deleteMessage(chatId, messageId);
            } catch (error) {
                console.error(`Failed to delete message ${messageId} in chat ${chatId}:`, error);
            }
        }
        delete messageIds[chatId];
    }
}

function calculateScore9(closedQuestions, openQuestions) {
    return (((openQuestions * 2) + closedQuestions) * 100) / 34;
}

function calculateAzerbaijaniScore11(ty, th) {
    return (2.5 * ((2 * th) + ty));
}

function calculateMathScore9(nQ, nAK, nA) {
    return (((nA * 2) + nAK + nQ) * 100) / 29;
}

function calculateMathScore11(rf, gh, fg) {
    return ((25 / 8) * ((2 * fg) + rf + gh));
}

function calculateEnglishScore11(rd, jh) {
    return ((100 / 37) * ((2 * jh) + rd));
}

function calculateTotalScore9(englishScore, azerbaijaniScore, mathScore) {
    return englishScore + azerbaijaniScore + mathScore;
}

function calculateTotalScore11(azerbaijaniScore, mathScore, englishScore) {
    return azerbaijaniScore + mathScore + englishScore;
}

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId]) {
        await sendMessageAndStoreId(chatId, 'Salam. Hədəf Steam Liseyinin DIM imtahan nəticənizi hesablamaq üçün düzəldilmiş bota xoş gəlmisiniz!\n\nBotdan istifadə təlimatları:\n/start - Botun işə salınması\n/return - Köhnə suala qayıdıb cavabın dəyişdirilməsi\n/clear - Söhbətin silinməsi\n\nAçıq suallarda nəticənizi 2.4 kimi kəsr şəkilində də yaza bilərsiniz. Əgər açıq suallarınız tam baldırsa kəsr yazmağa ehtiyac yoxdur, sadəcə rəqəm yazırsınız.\n\nBota şəkil,fayl,səs yazısı və video göndərmək qəti qadağandır.\n\nZəhmət olmasa menyudan sinifinizi seçin...', {
            reply_markup: {
                keyboard: [
                    [{ text: '9' }, { text: '11' }]
                ],
                resize_keyboard: true
            }
        });
    } else {
        await sendMessageAndStoreId(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür.');
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (!messageIds[chatId]) {
        messageIds[chatId] = [];
    }
    messageIds[chatId].push(msg.message_id);

    if ((msg.text == '9' || msg.text == '11') && letnow[chatId] === undefined) {
        await sendMessageAndStoreId(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın.');
        letnow[chatId] = [0, msg.text]; // Stage 0 indicates asking for name and surname
        users[chatId] = { answers: [], grade: msg.text, currentQuestion: 0 }; // Initialize user's data structure with grade
    } else {
        handleUserResponse(msg, chatId);
    }
});

async function handleUserResponse(msg, chatId) {
    if (msg.text == '/start') {
        delete users[chatId];
        delete letnow[chatId];
    } else if (msg.text == '/clear') {
        await clearChatHistory(chatId);
        await sendMessageAndStoreId(chatId, 'Söhbət tarixçəsi silindi.Botu yenidən işə salmaq üçün /start yazın.');
    } else if (msg.text == '/return' && letnow[chatId] !== undefined) {
        const stage = letnow[chatId][0];
        if (stage > 1) {
            letnow[chatId][0] = stage - 1;
            users[chatId].currentQuestion = stage - 2; // Update current question to the previous one
            await sendMessageAndStoreId(chatId, `Əvvəlki suala qayıtdınız.Cavabınızı dəyişdirə bilərsiniz.\n${letnow[chatId][1] === '9' ? questions9[stage - 2].text : questions11[stage - 2].text}`);
        } else {
            await sendMessageAndStoreId(chatId, 'Siz artıq ilk mərhələdəsiniz. Adınızı və soyadınızı yazın.');
        }
    } else {
        const stage = letnow[chatId] ? letnow[chatId][0] : undefined;

        if (stage === 0) { // Asking for name and surname
            if (validateNameSurname(msg.text)) {
                users[chatId].nameSurname = msg.text.trim();
                await sendMessageAndStoreId(chatId, letnow[chatId][1] === '9' ? questions9[0].text : questions11[0].text);
                letnow[chatId][0] += 1; // Move to next stage
            } else {
                await sendMessageAndStoreId(chatId, 'Zəhmət olmasa düzgün ad və soyad daxil edin.');
            }
        } else if (stage !== undefined) {
            const currentQuestion = users[chatId].currentQuestion;
            const currentQuestions = letnow[chatId][1] === '9' ? questions9 : questions11;
            const maxValue = currentQuestions[currentQuestion].maxValue;

            if (validateInput(parseInt(msg.text), maxValue)) {
                users[chatId].answers[currentQuestion] = parseInt(msg.text);
                users[chatId].currentQuestion += 1;

                if (users[chatId].currentQuestion < currentQuestions.length) {
                    await sendMessageAndStoreId(chatId, currentQuestions[users[chatId].currentQuestion].text);
                    letnow[chatId][0] += 1; // Move to next stage
                } else {
                    await sendMessageAndStoreId(chatId, 'Hesablamalar aparılır, zəhmət olmasa gözləyin...');
                    await sendResults(chatId);
                }
            } else {
                await sendMessageAndStoreId(chatId, `Səhv məlumat daxil etdiniz.Zəhmət olmasa düzgün cavabı daxil edin (0-${maxValue}).`);
            }
        }
    }
}

async function sendResults(chatId) {
    const answers = users[chatId].answers;
    const grade = users[chatId].grade;
    const nameSurname = users[chatId].nameSurname;

    let resultsText;

    if (grade === '9') {
        const englishScore = calculateScore9(answers[0], answers[1]);
        const azerbaijaniScore = calculateScore9(answers[2], answers[3]);
        const mathScore = calculateMathScore9(answers[4], answers[5], answers[6]);
        const totalScore = calculateTotalScore9(englishScore, azerbaijaniScore, mathScore);

        resultsText = `${nameSurname}\nİngilis dili balınız: ${englishScore.toFixed(2)}\nAzərbaycan dili balınız: ${azerbaijaniScore.toFixed(2)}\nRiyaziyyat balınız: ${mathScore.toFixed(2)}\n\nÜmumi balınız: ${totalScore.toFixed(2)}`;
    } else if (grade === '11') {
        const azerbaijaniScore = calculateAzerbaijaniScore11(answers[0], answers[1]);
        const mathScore = calculateMathScore11(answers[2], answers[3], answers[4]);
        const englishScore = calculateEnglishScore11(answers[5], answers[6]);
        const totalScore = calculateTotalScore11(azerbaijaniScore, mathScore, englishScore);

        resultsText = `${nameSurname}\nAzərbaycan dili balınız: ${azerbaijaniScore.toFixed(2)}\nRiyaziyyat balınız: ${mathScore.toFixed(2)}\nİngilis dili balınız: ${englishScore.toFixed(2)}\n\nÜmumi balınız: ${totalScore.toFixed(2)}`;
    }

    await sendMessageAndStoreId(chatId, resultsText);

    // Reset user data
    delete users[chatId];
    delete letnow[chatId];
}

// Error handling
bot.on('polling_error', (error) => {
    console.error(error);
});

console.log('Bot is running...');
