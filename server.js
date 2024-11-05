require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('./db');

const app = express();
const hostName = '192.168.0.104';
const port = 3000;

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


    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: 'Email уже занят' });
    }

    const existingUserName = await User.findOne({ where: { username } });
    if (existingUserName) {
        return res.status(409).json({ message: 'User name уже занят' });
    }

    const newUser = await User.create({ username, email, password });
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error('Произошла ошибка:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Email уже занят' });
        }
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

app.post('/api/loginData', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUserName = await User.findOne({ where: { username } });
        if(existingUserName && existingUserName.password == password){
            // const accessToken = jwt.sign({ id: existingUserName.id, email: existingUserName.email }, process.env.DB_NAME, { expiresIn: '15s'});
            return res.status(200).json({
                    // accessToken: accessToken,
                    user: {
                        id: existingUserName.id,
                        email: existingUserName.email
                    },
                    redirectUrl: '/'
                })
        }else if(!existingUserName){
            return res.status(409).json({ message: 'Invalid password or nickname' });
        }else if(existingUserName.password != password){
            return res.status(409).json({ message: 'Invalid password or nickname' });
        }
    } catch (error) {
        console.error('Произошла ошибка:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
})

sequelize.sync()
    .then(() => {
        console.log('Модели успешно синхронизированы с базой данных.');
        app.listen(port, hostName, () => {
            console.log(`Сервер запущен по url http://${hostName}:${port}/`);
        });
    })
    .catch(err => {
        console.error('Ошибка при синхронизации моделей:', err);
    });