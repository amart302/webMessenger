require('dotenv').config();
const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { sequelize, User, Message } = require('./db');
const { log } = require('console');

const app = express();
const hostName = '127.0.0.1';
const port = 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','login.html'));
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/registerData', async (req, res) => {
    try {
    const { username, email, password } = req.body;

    const existingUserName = await User.findOne({ where: { username } });
    if (existingUserName) {
        return res.status(409).json({ message: 'Username уже занят' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: 'Email уже занят' });
    }

    const newUser = await User.create({ username, email, password });
        return res.status(200).json({
            user: {
                id: newUser.user_id,
                username: newUser.username,
                email: newUser.email
            },
            redirectUrl: '/'
        });
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

app.post('/api/loginData', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUserName = await User.findOne({ where: { username } });
        if(existingUserName && existingUserName.password == password){
            return res.status(200).json({
                    user: {
                        id: existingUserName.user_id,
                        username: existingUserName.username,
                        email: existingUserName.email
                    },
                    redirectUrl: '/'
                })
        }else if(!existingUserName){
            return res.status(409).json({ message: 'Неверный пароль или ник пользователя' });
        }else if(existingUserName.password != password){
            return res.status(409).json({ message: 'Неверный пароль или ник пользователя' });
        }
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
})

const wss = new WebSocket.Server({ port: port });

wss.on('connection', async (ws) => {
    console.log('New client connected');
    try{
        const messages = await Message.findAll();
        ws.send(JSON.stringify(messages));
    } catch (error) {
        console.log(`Error ${error}`);
    }


    ws.on('message', async (rawMessage) => {
        const { id, username, message } = JSON.parse(rawMessage);
        console.log(id);
        
        console.log(`${username}: ${message}`);
        
        try {
            const newMessage = await Message.create({ user_id: id, username: username, content: message});

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(newMessage));
                }
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


console.log(`Сервер запущен по url http://${hostName}:${port}/register`);


sequelize.sync()
    .then(() => {
        console.log('Модели успешно синхронизированы с базой данных.');
        app.listen(port, hostName, () => {
            console.log(`Сервер запущен по url http://${hostName}:${port}/register`);
        });
    })
    .catch(err => {
        console.error('Ошибка при синхронизации моделей:', err);
    });
    