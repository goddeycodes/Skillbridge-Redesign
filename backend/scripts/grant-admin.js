/**
 * Grant admin access to a user by email.
 * Usage: node scripts/grant-admin.js your@email.com
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/grant-admin.js your@email.com');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      'UPDATE "Users" SET "isAdmin" = true WHERE email = :email RETURNING name, email, "isAdmin"',
      { replacements: { email } }
    );
    if (!rows.length) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }
    console.log('Admin granted:', rows[0]);
    console.log('Log out and sign back in to see the Admin Panel.');
    await sequelize.close();
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
