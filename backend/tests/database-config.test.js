jest.mock('sequelize', () => {
  const Sequelize = jest.fn().mockImplementation((database, username, password, options) => ({
    database,
    username,
    password,
    options,
  }));

  return { Sequelize };
});

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('database configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.PG_HOST = 'db.example.supabase.co';
    process.env.PG_PORT = '5432';
    process.env.PG_DATABASE = 'postgres';
    process.env.PG_USER = 'postgres';
    process.env.PG_PASSWORD = 'secret';
    process.env.PG_SSL = 'true';
    process.env.PG_SSL_REJECT_UNAUTHORIZED = 'false';
  });

  it('configures SSL for Supabase-style PostgreSQL connections', () => {
    const { Sequelize } = require('sequelize');
    require('../src/config/database');

    expect(Sequelize).toHaveBeenCalledWith(
      'postgres',
      'postgres',
      'secret',
      expect.objectContaining({
        host: 'db.example.supabase.co',
        dialect: 'postgres',
        dialectOptions: expect.objectContaining({
          ssl: expect.objectContaining({
            require: true,
            rejectUnauthorized: false,
          }),
        }),
      })
    );
  });
});
