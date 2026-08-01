const dns = require('dns');
const dnsPromises = dns.promises;

const isIPv6 = (value) => typeof value === 'string' && value.includes(':');
const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

const resolve6 = (host) => new Promise((resolve, reject) => {
  resolver.resolve6(host, (err, addresses) => {
    if (err) return reject(err);
    resolve(addresses);
  });
});

const resolve4 = (host) => new Promise((resolve, reject) => {
  resolver.resolve4(host, (err, addresses) => {
    if (err) return reject(err);
    resolve(addresses);
  });
});

const resolveDatabaseHost = async (host) => {
  if (!host) return host;
  if (isIPv6(host)) return host;

  try {
    const results = await dnsPromises.lookup(host, { all: true });
    if (results?.length) {
      const ipv4Result = results.find((entry) => entry.family === 4);
      const ipv6Result = results.find((entry) => entry.family === 6);
      if (ipv4Result) return ipv4Result.address;
      if (ipv6Result) return ipv6Result.address;
      return results[0].address;
    }
  } catch (err) {
    if (!['ENOTFOUND', 'EAI_NONAME', 'ENODATA'].includes(err.code)) {
      throw err;
    }
  }

  try {
    const v4 = await resolve4(host);
    if (v4?.length) return v4[0];
  } catch (_) {}

  try {
    const v6 = await resolve6(host);
    if (v6?.length) return v6[0];
  } catch (_) {}

  return host;
};

module.exports = { resolveDatabaseHost };
