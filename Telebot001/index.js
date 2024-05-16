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
const token = "7189509884:AAEcpDDQNlfsBbdYGuylHsFiPUPYN1OadP8";

const bot = new TelegramBot(token, { polling: true });

const commands = ['/start', '/return', '/clear'];

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

// Dictionary to store exam status for each user
var examStatus = {};

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

// Function to validate name and surname
function validateNameSurname(input) {
    const parts = input.trim().split(/\s+/);
    return parts.length === 2 && parts[0] && parts[1];
}

// Function to delete chat history
async function clearChatHistory(chatId) {
    if (messageIds[chatId]) {
        await batchDeleteMessages(chatId, messageIds[chatId]);
        delete messageIds[chatId];
    }
}

// Batch delete function
async function batchDeleteMessages(chatId, messageIdsArray) {
    for (const msgId of messageIdsArray) {
        try {
            await bot.deleteMessage(chatId, msgId);
        } catch (error) {
            console.error(`Failed to delete message ${msgId} in chat ${chatId}:`, error);
            // Delay before trying to delete the next message
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}

bot.onText(/\/start/, (msg) => {
    var chatId = msg.chat.id;
    if (!examStatus[chatId]) { // Check if the user's exam is not in progress
        bot.sendMessage(chatId, 'Salam.Hədəf Steam Liseyinin DIM imtahan nəticənizi hesablamağınız üçün düzəltdiyi bota xoş gəlmisiniz!\n\nBotdan istifadə təlimatları:\n /start - Botun işə salınması\n /return - Köhnə suala qayıdıb cavabın dəyişdirilməsi\n /clear - Söhbətin silinməsi\n\nAçıq suallarda nəticənizi 2.4 kimi kəsr şəkindədə yaza bilərsiniz.Əgər açıq suallarınız tam baldırsa kəsr yazmağa ehtiyaz yoxdur, sadəcə rəqəm yazırsınız\n\nBota şəkil,video,fayl,səs yazısı göndərmək qəti qadağandır\n\nZəhmət olmasa menyudan sinifinizi seçin...', {
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

    if (msg.text == '9' && letnow[chatId] === undefined) {
        bot.sendMessage(chatId, 'Zəhmət olmasa adınızı və soyadınızı yazın.').then((sentMsg) => {
            messageIds[chatId].push(sentMsg.message_id);
        });
        letnow[chatId] = [0, 9]; // Stage 0 indicates asking for name and surname
        users[chatId] = { answers: [] }; // Initialize user's data structure
    } else if (msg.text == '11' && letnow[chatId] === undefined) {
        bot.sendMessage(chatId, 'Hal-hazırda bu xidmətin aktiv olması üçün işlər görülür').then((sentMsg) => {
            messageIds[chatId].push(sentMsg.message_id);
        });
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
                bot.sendMessage(chatId, `Əvvəlki suala qayıtdInız.Cavabınızı dəyişdirin.\n ${questions[stage - 2].text}`).then((sentMsg) => {
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
                    bot.sendMessage(chatId, questions[0].text).then((sentMsg) => {
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
                let num = parseInt(msg.text);

                if (commands.indexOf(msg.text) == -1) {
                    if (validateInput(num, questions[quiz[0] - 1].maxValue)) {
                        users[chatId].answers.push(num);
                        if (quiz[0] === questions.length) {
                            const eng = parseFloat(calculateScore(users[chatId].answers[0], users[chatId].answers[1]).toFixed(2));
                            const az = parseFloat(calculateScore(users[chatId].answers[2], users[chatId].answers[3]).toFixed(2));
                            const math = parseFloat(calculateMathScore(users[chatId].answers[4], users[chatId].answers[5], users[chatId].answers[6]).toFixed(2));
                            const total = parseFloat(calculateTotalScore(eng, az, math).toFixed(2));
                            bot.sendMessage(chatId, `${users[chatId].nameSurname}\n\nİngilis dili: ${eng}\nAzərbaycan dili: ${az}\nRiyaziyyat: ${math}\n\Sizin yekun nəticəniz: ${total}`).then((sentMsg) => {
                                messageIds[chatId].push(sentMsg.message_id);
                            });
                            delete users[chatId];
                            delete letnow[chatId];
                            return;
                        }
                        bot.sendMessage(chatId, questions[quiz[0]].text).then((sentMsg) => {
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
