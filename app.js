const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const token = '940902251:AAGhOEXEcyshKNQeBU6cAMqQA6cX9Fu4nEM';
const db = require('./config/keys').mongoURI;

const User = require('./models/User');

const bot = new TelegramBot(token, {polling: true});

// Connect tot mongoDB
mongoose
    .connect(db)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

//Start command
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome");
});

//Todo command
bot.onText(/\/todo/, msg => {
    const chatId = msg.chat.id;
    let todo = msg.text.split(' ').slice(1).join(' ');

    // No item passed in
    if(!todo) {
        return bot.sendMessage(chatId, "You should give me your todo item");
    }

    User.findOne({
        user: msg.chat.username
    }).then(
        user => {
            if(!user){
                //Create new user
                const newUser = new User(
                    {
                        user: msg.chat.username,
                        todos: [todo]
                    }
                );

                //Save newUser to mongoDB
                newUser.save()
                .then(console.log('New User Saved'))
                .catch(err => console.log(err));
            }else{
                //Add new todo to mongoDB
                user.todos.push(todo);
                User.update({
                    user: user.user
                }, {
                    $set: {todos: user.todos}
                },(err, raw) => {
                    if(err) return console.log(err);
                    console.log("Success Added new todo");
                }
                );
            }
        });
        bot.sendMessage(chatId, "You success added to TODO");
});


const port = process.evn.PORT;

app.get('/', (req, res) => {
    res.end("Telegram Todo Bot");
});

app.listen(port);