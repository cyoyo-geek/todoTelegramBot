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


//List Command
bot.onText(/\/list/, msg => {
    const chatId = msg.chat.id;
    User.findOne({user: msg.chat.username})
    .then(
        user => {
            if(!user) {
                return bot.sendMessage(chatId, "You should\t added a todo item");
            } else {
                if(user.todos.length === 0) return bot.sendMessage(chatId, '*You already done all your todos*'
                , { parse_mode: "Markdown"});
                // List user's todos
                let todoList = '';
                user.todos.forEach(
                    (todo, index) => {
                        todoList += `[${index}] - `  + todo + "\n";
                    }
                );
                return bot.sendMessage(chatId, "*Your Todo List:\n\n*${}"
                , { parse_mode: "Markdown"});
            }
        }
    );
});


//Check Command
bot.onText(/\/check/, msg => {
    const chatId = msg.chat.id;
    User.findOne({user: msg.chat.username})
    .then(
        user => {
            if(!user) {
                return bot.sendMessage(chatId, "You should\t added a todo item");
            } else {
                if(user.todos.length === 0) return bot.sendMessage(msg.chat.id, '*You already done all your todos*'
                , { parse_mode: "Markdown"});
                
                let num = msg.text.split(' ')[1];

                //No num passed in
                if(!num){
                    return bot.sendMessage(chatId, 
                        'You should give me the todo number'); 
                }

                // Wrong number
                if(!num >= user.todos.length){
                    return bot.sendMessage(chatId, 
                        "Opps. There's no todo with the number, please type /list and check it again."); 
                }

                // Remove todo from mongoDB
                user.todos.splice(num, 1);
                User.update({
                    user: user.user
                }, {
                    $set: {todos: user.todos}
                },(err, raw) => {
                    if(err) return console.log(err);
                    bot.sendMessage(msg.chat.id, "DONE!");
                });
            }
        }
    );
});



const port = process.env.PORT;

app.get('/', (req, res) => {
    res.end("Telegram Todo Bot");
});

app.listen(port);