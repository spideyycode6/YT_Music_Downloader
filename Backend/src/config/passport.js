import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config.js';
import UserModel from '../model/user.model.js';

if (config.googleClientId && config.googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: config.googleCallbackUrl,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await UserModel.findOne({ googleId: profile.id });
      if (!user) {
        user = await UserModel.create({
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || '',
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
