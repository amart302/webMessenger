require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
});

sequelize.authenticate()
    .then(() => {
        console.log('Подключение к базе данных успешно установлено.');
    })
    .catch(err => {
        console.error('Не удалось подключиться к базе данных:', err);
    });

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
    }, {
        tableName: 'users',
        timestamps: false
});

const Message = sequelize.define('Message', {
    message_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
    }, {
        tableName: 'messages',
        timestamps: false
});


Message.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Message };