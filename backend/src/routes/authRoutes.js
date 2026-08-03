const router = require('express').Router();
const passport = require('passport');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe, googleCallback } = require('../controllers/authController');

// Email / password
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
      .matches(/[0-9]/).withMessage('Password must contain a number.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

// Google OAuth (only active when configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=oauth_failed' }),
    googleCallback
  );
} else {
  // Return a clear 501 so the frontend can handle the flow gracefully.
  router.get('/google', (req, res) => res.status(501).json({ success: false, message: 'Google OAuth not configured on the server.' }));
  router.get('/google/callback', (req, res) => res.status(501).json({ success: false, message: 'Google OAuth not configured on the server.' }));
}

module.exports = router;
