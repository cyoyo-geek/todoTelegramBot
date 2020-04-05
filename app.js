const TelegramBot = require('node-telegram-bot-api');

const token = '940902251:AAGhOEXEcyshKNQeBU6cAMqQA6cX9Fu4nEM';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome");
});