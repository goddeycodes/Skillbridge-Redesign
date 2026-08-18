const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

const isSslEnabled = process.env.PG_SSL === 'true' || process.env.PG_SSL === '1';
const sslConfig = isSslEnabled
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    }
  : undefined;

const getPostgresConfig = () => {
  const connectionString = process.env.DATABASE_URL || process.env.PG_DATABASE_URL;

  if (connectionString) {
    const parsed = new URL(connectionString);
    return {
      database: parsed.pathname.replace(/^\//, ''),
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      ...(sslConfig ? { dialectOptions: sslConfig } : {}),
    };
  }

  return {
    database: process.env.PG_DATABASE || 'postgres',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT || 5432),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    ...(sslConfig ? { dialectOptions: sslConfig } : {}),
  };
};

const sequelize = new Sequelize(
  getPostgresConfig().database,
  getPostgresConfig().username,
  getPostgresConfig().password,
  {
    host: getPostgresConfig().host,
    port: getPostgresConfig().port,
    dialect: getPostgresConfig().dialect,
    logging: getPostgresConfig().logging,
    ...(getPostgresConfig().dialectOptions ? { dialectOptions: getPostgresConfig().dialectOptions } : {}),
  }
);

// Exported flag to indicate whether Postgres is available. Callers can
// check this to avoid performing DB operations when the database is down.
let POSTGRES_AVAILABLE = false;

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    // Safety net when sync alter did not run (e.g. NODE_ENV !== development)
    await sequelize.query(
      'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;'
    );
    POSTGRES_AVAILABLE = true;
    console.log('PostgreSQL connected.');
  } catch (err) {
    POSTGRES_AVAILABLE = false;
    console.warn('PostgreSQL connection failed:', err.message || err);
    throw err;
  }
};

const connectMongo = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge';
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 3000,
  });
  console.log('MongoDB connected.');
};

const isPostgresAvailable = () => POSTGRES_AVAILABLE;

module.exports = { sequelize, connectPostgres, connectMongo, isPostgresAvailable };
