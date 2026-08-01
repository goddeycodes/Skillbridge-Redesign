const dns = require('dns');
const { promises: dnsPromises } = dns;
const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

const host = 'db.ddugeiukqfjhvncubduu.supabase.co';

(async () => {
  try {
    const lookupAll = await dnsPromises.lookup(host, { all: true });
    console.log('lookup all:', lookupAll);
  } catch (err) {
    console.error('lookup err:', err.code, err.message);
  }

  try {
    const resolve6 = await resolver.resolve6(host);
    console.log('resolve6:', resolve6);
  } catch (err) {
    console.error('resolve6 err:', err.code, err.message);
  }

  try {
    const resolve4 = await resolver.resolve4(host);
    console.log('resolve4:', resolve4);
  } catch (err) {
    console.error('resolve4 err:', err.code, err.message);
  }
})();
