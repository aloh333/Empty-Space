const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Ebook = require('./ebook');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Ebook = Ebook;

User.init(sequelize);
Ebook.init(sequelize);

User.associate(db);
Ebook.associate(db);

module.exports = db;