const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

module.exports = () => {
  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        return done(null, payload);
      } catch (err) {
        return done(err, false);
      }
    }
  ));

  // Google OAuth temporarily disabled until credentials are configured.
  //
  // passport.use(new GoogleStrategy(
  //   {
  //     clientID: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //     callbackURL: process.env.GOOGLE_CALLBACK_URL,
  //   },
  //   async (accessToken, refreshToken, profile, done) => done(null, profile)
  // ));
};