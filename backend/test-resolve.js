const { resolveDatabaseHost } = require('./src/config/resolveHost');

(async () => {
  try {
    const resolved = await resolveDatabaseHost('db.ddugeiukqfjhvncubduu.supabase.co');
    console.log('resolved host:', resolved);
  } catch (err) {
    console.error('resolve error:', err);
    process.exit(1);
  }
})();
