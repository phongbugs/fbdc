const env = process.env.NODE_ENV || 'development',
  dbConfig = require('../config/db.config.json')[env];

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.customer = require('./customer.js')(sequelize, Sequelize);
db.user = require('./user.js')(sequelize, Sequelize);

module.exports = db;
