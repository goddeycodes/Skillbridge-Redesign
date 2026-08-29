/**
 * Grant admin access to one or more users by email.
 * Usage:
 *   node scripts/grant-admin.js richloveantwi355@gmail.com
 *   node scripts/grant-admin.js user1@example.com user2@example.com
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');

const emails = process.argv.slice(2).map(e => e.trim().toLowerCase()).filter(Boolean);
if (!emails.length) {
  console.error('Usage: node scripts/grant-admin.js email@example.com [more@example.com ...]');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    for (const email of emails) {
      const [rows] = await sequelize.query(
        'UPDATE "Users" SET "isAdmin" = true WHERE email = :email RETURNING name, email, "isAdmin"',
        { replacements: { email } }
      );
      if (!rows.length) {
        console.warn(`No user found: ${email} (they must register first)`);
      } else {
        console.log('Admin granted:', rows[0]);
      }
    }
    console.log('Done. Affected users should log out and sign back in.');
    await sequelize.close();
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
