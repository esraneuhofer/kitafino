const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

// Assuming you have a User model defined with a schema and methods, replace 'User' with your actual model.
const Schooluser = mongoose.model('Schooluser');

passport.use(
  new localStrategy({ usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Find a user with the provided email
        const user = await Schooluser.findOne({ email });

        // If no user with the provided email is found
        if (!user) {
          return done(null, false, { message: 'Email is not registered' });
        }

        // Verify the user's password
        const isPasswordValid = await user.verifyPassword(password);

        // If the password is incorrect
        if (!isPasswordValid) {
          return done(null, false, { message: 'Wrong password' });
        }

        // Authentication succeeded
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
);
