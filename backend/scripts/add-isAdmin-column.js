require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(
      'ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;'
    );
    console.log('Added isAdmin column to Users table.');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
