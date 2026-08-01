const path = require('path');
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const { resolveDatabaseHost } = require('../src/config/resolveHost');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function verifyPostgres() {
  const primaryHost = process.env.PG_HOST;
  const fallbackHost = process.env.PG_HOST_IPV4;
  const ports = [process.env.PG_PORT || 5432, process.env.PG_PORT_FALLBACK || 6543];
  const hostsToTry = [primaryHost];

  if (fallbackHost && !hostsToTry.includes(fallbackHost)) {
    hostsToTry.push(fallbackHost);
  }

  let lastError;

  for (const host of hostsToTry) {
    const resolvedHost = await resolveDatabaseHost(host);
    console.log(`Trying PostgreSQL host: ${host} (resolved: ${resolvedHost})`);

    for (const port of ports) {
      const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
        host: resolvedHost,
        port,
        dialect: 'postgres',
        dialectOptions: process.env.PG_SSL === 'true'
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
      });

      try {
        await sequelize.authenticate();
        console.log(`PostgreSQL connection OK via ${resolvedHost}:${port}`);
        return;
      } catch (err) {
        lastError = err;
        console.warn(`PostgreSQL connection failed for ${resolvedHost}:${port}: ${err.message}`);
      }
    }
  }

  throw lastError || new Error('Unable to connect to PostgreSQL');
}

async function verifyMongo() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connection OK');
}

async function main() {
  try {
    await verifyPostgres();
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    process.exitCode = 1;
  }

  try {
    await verifyMongo();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  await mongoose.disconnect();
}

main();
