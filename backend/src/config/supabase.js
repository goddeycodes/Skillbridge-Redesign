const { verifyAuth } = require('@supabase/server');
const { verifyToken } = require('./jwt');
const User = require('../models/User');

const makeRequestLike = (req) => ({
  headers: {
    get: (name) => {
      const value = req.headers[name.toLowerCase()];
      if (Array.isArray(value)) return value.join(', ');
      return value ?? null;
    },
  },
});

const verifySupabaseAuth = async (token) => {
  const requestLike = makeRequestLike({ headers: { authorization: `Bearer ${token}` } });
  const { data, error } = await verifyAuth(requestLike, { auth: 'user' });

  if (error) {
    const err = new Error(error.message || 'Supabase auth failed');
    err.status = error.status || 401;
    throw err;
  }

  return data;
};

const loadUserFromSupabaseClaims = async (userClaims) => {
  const email = userClaims?.email;
  if (!email) {
    const err = new Error('Supabase auth did not return an email address.');
    err.status = 401;
    throw err;
  }

  const defaultName = userClaims.email?.split?.('@')?.[0] || 'Supabase user';
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      name: defaultName,
      email,
      isVerified: true,
    },
  });

  if (!user.isActive) {
    const err = new Error('User account is deactivated.');
    err.status = 401;
    throw err;
  }

  return user;
};

const verifySupabaseToken = async (token) => {
  const { userClaims } = await verifySupabaseAuth(token);
  return loadUserFromSupabaseClaims(userClaims);
};

const verifyLocalToken = async (token) => {
  const decoded = verifyToken(token);
  const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
  if (!user || !user.isActive) {
    const err = new Error('User not found or deactivated.');
    err.status = 401;
    throw err;
  }
  return user;
};

const verifyUserToken = async (token) => {
  if (!token) {
    const err = new Error('No token provided.');
    err.status = 401;
    throw err;
  }

  try {
    return await verifySupabaseToken(token);
  } catch (err) {
    if (err.status === 401) {
      return verifyLocalToken(token);
    }
    throw err;
  }
};

module.exports = { verifyUserToken };
