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
  // Fail loudly instead of producing a broken relative redirect
  // ("undefined/auth/callback...") that silently 404s on the API server
  // instead of landing the user back on the frontend. This was very likely
  // the actual cause of "unreliable" Google sign-in — it fails differently
  // depending on whether CLIENT_URL happens to be set in a given environment.
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    console.error('googleCallback: CLIENT_URL is not set — cannot redirect back to the frontend.');
    return res.status(500).json({
      success: false,
      message: 'Server misconfiguration: CLIENT_URL is not set.',
    });
  }

  try {
    const profile  = req.user; // populated by passport-google-oauth20
    const email    = profile.emails?.[0]?.value?.trim().toLowerCase();
    const name     = profile.displayName;
    const avatar   = profile.photos?.[0]?.value;
    const googleId = profile.id;

    // Google didn't return an email (can happen depending on consent scope) —
    // we can't create or match an account without one. Fail with a specific,
    // debuggable error code instead of a generic oauth_failed.
    if (!email) {
      console.error('googleCallback: Google profile did not include an email address.', { googleId, name });
      return res.redirect(`${clientUrl}/auth/login?error=oauth_no_email`);
    }

    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      user = await User.findOne({ where: { email } });
      if (user) {
        await user.update({ googleId, avatar: avatar || user.avatar });
      }
    }

    if (!user) {
      try {
        user = await User.create({ name, email, googleId, avatar, isVerified: true });
      } catch (createErr) {
        // Most likely cause: a race where two callbacks fired for the same
        // new user (double-click, browser retry) and the unique email
        // constraint rejected the second insert. Recover by re-fetching
        // instead of surfacing a 500 to the user.
        if (createErr.name === 'SequelizeUniqueConstraintError') {
          user = await User.findOne({ where: { email } });
        }
        if (!user) throw createErr;
      }
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${clientUrl}/auth/login?error=oauth_failed`);
  }
};