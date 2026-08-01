jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
  Resolver: jest.fn().mockImplementation(() => ({
    setServers: jest.fn(),
    resolve4: jest.fn(),
    resolve6: jest.fn(),
  })),
}));

describe('resolveDatabaseHost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefers IPv4 addresses when lookup returns both families', async () => {
    const dns = require('dns');
    dns.promises.lookup.mockResolvedValue([
      { address: '2001:db8::10', family: 6 },
      { address: '192.0.2.10', family: 4 },
    ]);

    const { resolveDatabaseHost } = require('../src/config/resolveHost');

    await expect(resolveDatabaseHost('db.example.com')).resolves.toBe('192.0.2.10');
  });
});
