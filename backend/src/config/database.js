const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const connectPostgres = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('PostgreSQL connected.');
};

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected.');
};

module.exports = { sequelize, connectPostgres, connectMongo };
