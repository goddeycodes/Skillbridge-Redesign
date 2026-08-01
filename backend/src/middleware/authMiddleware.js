const { verifyUserToken } = require('../config/supabase');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authorised. No token.' });

    const token = authHeader.split(' ')[1];
    const user = await verifyUserToken(token);
    req.user = user;
    next();
  } catch (err) {
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 401;
    return res.status(status).json({ success: false, message: err.message || 'Invalid or expired token.' });
  }
};

module.exports = { protect };
