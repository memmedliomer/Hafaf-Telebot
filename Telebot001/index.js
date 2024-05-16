const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is alive");
});

const port = 3000;

var users = {};
var messageIds = {}; // Store message IDs for each user

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Replace the value below with the Telegram token you receive from @BotFather
const token = "YOUR_TELEGRAM_BOT_TOKEN";

const bot = new TelegramBot(token, { polling: true });

const commands = ['/start', '/return', '/clear'];

var letnow = {};

const questions9 = [
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
        text: 'Riyaziyyat fənnindən 15 qapalı sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 15
    },
    {
        text: 'Riyaziyyat fənnindən 6 açıq kodlaşdırıla bilən sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 6
    },
    {
        text: 'Riyaziyyat fənnindən 4 tam açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 4
    }
];

const questions11 = [
    {
        text: 'Azərbaycan dili fənnindən 20 qapalı sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 20
    },
    {
        text: 'Azərbaycan dili fənnindən 10 açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 10
    },
    {
        text: 'Riyaziyyat fənnindən 13 qapalı sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 13
    },
    {
        text: 'Riyaziyyat fənnindən 5 kodlaşdırıla bilən sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 5
    },
    {
        text: 'Riyaziyyat fənnindən 7 tam açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 7
    },
    {
        text: 'İngilis dili fənnindən 23 qapalı sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 23
    },
    {
        text: 'İngilis dili fənnindən 7 açıq sualdan düzgün cavablarınızın sayını yazın.',
        maxValue: 7
    }
];

// Dictionary to store exam status for each user
var examStatus = {};

// Function to calculate English score for 9th grade
function calculateScore9(closedQuestions, openQuestions) {
    return (((openQuestions * 2) + closedQuestions) * 100) / 34;
}

// Function to calculate Azerbaijani score for 11th grade
function calculateAzerbaijaniScore11(ty, th) {
    return (2.5 * ((2 * th) + ty));
}

// Function to calculate Mathematics score for 9th grade
function calculateMathScore9(nQ, nAK, nA) {
    return (((nA * 2) + nAK + nQ) * 100) / 29;
}

// Function to calculate Mathematics score for 11th grade
function calculateMathScore11(rf, gh, fg) {
    return ((25 / 8) * ((2 * fg) + rf + gh));
}

// Function to calculate English score for 11th grade
function calculateEnglishScore11(rd, jh) {
    return ((100 / 37) * ((2 * jh) + rd));
}

// Function to calculate total score for 9th grade
function calculateTotalScore9(englishScore, azerbaijaniScore, mathScore) {
    return englishScore + azerbaijaniScore + mathScore;
}

// Function to calculate total score for 11th grade
function calculateTotalScore11(azerbaijaniScore, mathScore, englishScore) {
    return azerbaijaniScore + mathScore + englishScore;
}

// Function to validate input
function validateInput(value, maxValue) {
    return value >= 0 && value <= maxValue && Number.isInteger(value);
}

// Function to validate name and surname
function validateNameSurname(input) {
    const parts = input.trim().split(/\s+/);
    return parts.length === 2 && parts[0] && parts[1];
}

// Function to delete chat history
async function clearChatHistory(chatId) {
    if (messageIds[chatId]) {
        for (const messageId of messageIds[chatId]) {
            try {
                await bot.deleteMessage(chatId, messageId);
            } catch (error) {
                console.error(`Failed to delete message ${messageId} in chat ${chatId}:`, error);
                // If deletion fails, continue with the next message
            }
        }
        delete messageIds[chatId];
    }
}

bot.onText(/\/start/, (msg) => {
    var chatId = msg.chat.id;
    if (!examStatus[chatId]) { // Check if the user's exam is not in progress
        bot.sendMessage(chatId, 'Salam.Hədəf Steam Liseyinin DIM imtahan nəticənizi hesablamağınız üçün düzəltdiyi bota xoş gəlmisiniz!\n\nBotdan istifadə təlimatları:\n /start - Botun işə salınması\n /return - Köhnə suala qayıdıb cavabın dəyişdirilməsi\n /clear - Söhbətin silinməsi\n\nAçıq suallarda nəticənizi 2.4 kimi kəsr şəkindədə yaza bilərsiniz.Əgər açıq suallarınız tam baldırsa kəsr yazmağa ehtiyac yoxdur, sadəcə rəqəm yazırsınız\n\nZəhmət olmasa menyudan sinifinizi seçin...', {
            reply_markup: {
                keyboard: [
                    [{ text: '9' }, { text: '11' }]
                ],
                resize_keyboard: true
            }
        }).then((sentMsg) => {
            if (!messageIds[chatId]) {
                messageIds[chatId] = [];
            }
            messageIds[chatId].push(sentMsg.message_id);
        });
    } else {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür');
    }
    return;
});

bot.on('message', (msg) => {
    let chatId = msg.chat.id;

    if (!messageIds[chatId]) {
        messageIds[chatId] = [];
    }
    messageIds[chatId].push(msg.message_id);

    if ((msg.text == '9' || msg.text == '11') && letnow[chatId] === undefined) {
        bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın.').then((sentMsg) => {
            messageIds[chatId].push(sentMsg.message_id);
        });
        letnow[chatId] = [0, msg.text]; // Stage 0 indicates asking for name and surname
        users[chatId] = { answers: [], grade: msg.text }; // Initialize user's data structure with grade
    } else {
        if (msg.text == '/start') {
            delete users[chatId];
            delete letnow[chatId];
        } else if (msg.text == '/clear') {
            clearChatHistory(chatId).then(() => {
                bot.sendMessage(chatId, 'Bütün söhbət silindi.Yenidən başlamaq üçün /start yazın.').then((sentMsg) => {
                    messageIds[chatId] = [sentMsg.message_id];
                });
            });
        } else if (msg.text == '/return' && letnow[chatId] !== undefined) {
            let stage = letnow[chatId][0];
            if (stage > 1) {
                letnow[chatId][0] = stage - 1;
                bot.sendMessage(chatId, `Əvvəlki suala qayıtdınız.Cavabınızı dəyişdirin.\n${letnow[chatId][1] === '9' ? questions9[stage - 2].text : questions11[stage - 2].text}`).then((sentMsg) => {
                    messageIds[chatId].push(sentMsg.message_id);
                });
            } else {
                bot.sendMessage(chatId, 'Siz artıq ilk mərhələdəsiniz.Adınızı və soyadınız yazın.').then((sentMsg) => {
                    messageIds[chatId].push(sentMsg.message_id);
                });
            }
        } else {
            let stage = letnow[chatId] ? letnow[chatId][0] : undefined;

            if (stage === 0) { // Asking for name and surname
                if (validateNameSurname(msg.text)) {
                    users[chatId].nameSurname = msg.text.trim();
                    bot.sendMessage(chatId, letnow[chatId][1] === '9' ? questions9[0].text : questions11[0].text).then((sentMsg) => {
                        messageIds[chatId].push(sentMsg.message_id);
                    });
                    letnow[chatId][0] = 1; // Move to next stage
                } else {
                    bot.sendMessage(chatId, 'Zəhmət olmasa həm adınızı, həm də soyadınızı arada boşluq olmaqla yazın.').then((sentMsg) => {
                        messageIds[chatId].push(sentMsg.message_id);
                    });
                }
            } else if (stage !== undefined) {
                let quiz = letnow[chatId];
                let num = parseFloat(msg.text);

                if (commands.indexOf(msg.text) == -1) {
                    if (validateInput(num, (quiz[1] === '9' ? questions9[quiz[0] - 1].maxValue : questions11[quiz[0] - 1].maxValue))) {
                        users[chatId].answers.push(num);
                        if (quiz[0] === (quiz[1] === '9' ? questions9.length : questions11.length)) {
                            if (quiz[1] === '9') {
                                const eng = parseFloat(calculateScore9(users[chatId].answers[0], users[chatId].answers[1]).toFixed(2));
                                const az = parseFloat(calculateScore9(users[chatId].answers[2], users[chatId].answers[3]).toFixed(2));
                                const math = parseFloat(calculateMathScore9(users[chatId].answers[4], users[chatId].answers[5], users[chatId].answers[6]).toFixed(2));
                                const total = parseFloat(calculateTotalScore9(eng, az, math).toFixed(2));
                                bot.sendMessage(chatId, `${users[chatId].nameSurname}\n\nİngilis dili: ${eng}\nAzərbaycan dili: ${az}\nRiyaziyyat: ${math}\n\nSizin yekun nəticəniz: ${total}`).then((sentMsg) => {
                                    messageIds[chatId].push(sentMsg.message_id);
                                });
                            } else if (quiz[1] === '11') {
                                const az = parseFloat(calculateAzerbaijaniScore11(users[chatId].answers[0], users[chatId].answers[1]).toFixed(2));
                                const math = parseFloat(calculateMathScore11(users[chatId].answers[2], users[chatId].answers[3], users[chatId].answers[4]).toFixed(2));
                                const eng = parseFloat(calculateEnglishScore11(users[chatId].answers[5], users[chatId].answers[6]).toFixed(2));
                                const total = parseFloat(calculateTotalScore11(az, math, eng).toFixed(2));
                                bot.sendMessage(chatId, `${users[chatId].nameSurname}\n\nAzərbaycan dili: ${az}\nRiyaziyyat: ${math}\nİngilis dili: ${eng}\n\nSizin yekun nəticəniz: ${total}`).then((sentMsg) => {
                                    messageIds[chatId].push(sentMsg.message_id);
                                });
                            }
                            delete users[chatId];
                            delete letnow[chatId];
                            return;
                        }
                        bot.sendMessage(chatId, quiz[1] === '9' ? questions9[quiz[0]].text : questions11[quiz[0]].text).then((sentMsg) => {
                            messageIds[chatId].push(sentMsg.message_id);
                        });
                        letnow[chatId][0] = quiz[0] + 1;
                    } else {
                        bot.sendMessage(chatId, "Səhv yazdınız zəhmət olmasa yenidən yazın.").then((sentMsg) => {
                            messageIds[chatId].push(sentMsg.message_id);
                        });
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
