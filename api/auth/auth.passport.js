import passport from "passport";
const config = require("../../config");
import strategy from "passport-facebook";

import User from "../../db/models/User";

const FacebookStrategy = strategy.Strategy;

// dotenv.config();
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: config.fbClientID,
      clientSecret: config.fbClientSecret,
      callbackURL: config.fbCallbackURL,
      profileFields: ["email", "name"]
    },
    function(accessToken, refreshToken, profile, done) {
      const { email, first_name, last_name } = profile._json;
      const userData = {
        email,
        firstname: first_name,
        lastname: last_name
      };
      new userModel(userData).save();
      done(null, profile);
    }
  )
);