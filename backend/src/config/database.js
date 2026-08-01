const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const dns = require('dns');
const { resolveDatabaseHost } = require('./resolveHost');

const dnsPromises = dns.promises;

const getPostgresPorts = () => {
  const ports = [];
  const primaryPort = Number(process.env.PG_PORT || 5432);
  if (!Number.isNaN(primaryPort)) ports.push(primaryPort);

  const fallbackPort = Number(process.env.PG_PORT_FALLBACK || 6543);
  if (!Number.isNaN(fallbackPort) && !ports.includes(fallbackPort)) ports.push(fallbackPort);

  return ports;
};

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions:
      process.env.PG_SSL === 'true'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== 'false',
            },
          }
        : undefined,
    pool: {
      max: 5,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 10000,
    },
  }
);

const setSequelizeHost = (host, port) => {
  if (host && host !== sequelize.options.host) {
    sequelize.options.host = host;
    sequelize.config.host = host;
    if (sequelize.connectionManager?.config) {
      sequelize.connectionManager.config.host = host;
    }
    console.log(`Postgres host set to ${host}`);
  }

  if (port != null && port !== sequelize.options.port) {
    sequelize.options.port = port;
    sequelize.config.port = port;
    if (sequelize.connectionManager?.config) {
      sequelize.connectionManager.config.port = port;
    }
    console.log(`Postgres port set to ${port}`);
  }
};

const connectPostgres = async () => {
  const primaryHost = process.env.PG_HOST || 'localhost';
  const fallbackHost = process.env.PG_HOST_IPV4;
  const ports = getPostgresPorts();
  const hostsToTry = [primaryHost];

  if (fallbackHost && !hostsToTry.includes(fallbackHost)) {
    hostsToTry.push(fallbackHost);
  }

  let lastError;

  for (const host of hostsToTry) {
    const resolvedHost = await resolveDatabaseHost(host);
    for (const port of ports) {
      setSequelizeHost(resolvedHost, port);
      try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log(`PostgreSQL connected via ${resolvedHost}:${port}.`);
        return;
      } catch (err) {
        lastError = err;
        console.warn(`PostgreSQL connect failed for ${resolvedHost}:${port}: ${err.message}`);
      }
    }
  }

  throw lastError || new Error('Unable to connect to PostgreSQL');
};

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected.');
};

module.exports = { sequelize, connectPostgres, connectMongo };
