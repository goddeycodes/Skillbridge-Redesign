const User = require('../models/User');
const { generateToken } = require('../config/jwt');

const sanitizeUser = (user) => ({
  id:         user.id,
  name:       user.name,
  email:      user.email,
  avatar:     user.avatar,
  bio:        user.bio,
  credits:    user.credits,
  reputation: user.reputation,
  timezone:   user.timezone,
  isVerified: user.isVerified,
  isAdmin:    user.isAdmin,
});

// POST /api/auth/register
const { isPostgresAvailable } = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!isPostgresAvailable()) {
      return res.status(503).json({ success: false, message: 'Database is unavailable. Try again later.' });
    }

    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });

    const user  = await User.create({ name, email, password });
    const token = generateToken({ id: user.id, email: user.email });

    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me  (requires protect middleware)
exports.getMe = async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
};

// GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  try {
    const profile  = req.user; // populated by passport-google-oauth20
    const email    = profile.emails?.[0]?.value?.trim().toLowerCase();
    const name     = profile.displayName;
    const avatar   = profile.photos?.[0]?.value;
    const googleId = profile.id;

    let user = await User.findOne({ where: { googleId } });

    if (!user && email) {
      user = await User.findOne({ where: { email } });
      if (user) {
        await user.update({ googleId, avatar: avatar || user.avatar });
      }
    }

    if (!user) {
      user = await User.create({ name, email, googleId, avatar, isVerified: true });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${process.env.CLIENT_URL}/auth/login?error=oauth_failed`);
  }
};
