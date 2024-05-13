const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const School = mongoose.model('SchoolNew');
const Schooluser = mongoose.model('Schooluser');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const {getEmailResetPassword} = require('./email-reset-password')
const {getHtmlRegistrationEmail} = require('./email-registration');
var transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: '5/5e_FBw)JWTXpu!!adsaaa22'
  }
});
function makePassword() {
  var text = "";
  var possible = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
const User = mongoose.model('User');



module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({"token": user.generateJwt()});
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
}

module.exports.userProfile = async (req, res, next) => {
  try {
    const user = await Schooluser.findOne({_id: req._id}).exec();

    if (!user) {
      return res.status(404).json({ status: false, message: 'User record not found.' });
    } else {
      return res.status(200).json({ status: true, user: _.pick(user, ['username', 'email']) });
    }
  } catch (err) {
    // Handle errors here, for example:
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports.getUsers = (req, res, next) => {

  User.find(
    (err, user) => {
      if (!user)
        return res.status(404).json({status: false, message: 'User record not found.'});
      else
        return res.status(200).json({status: true, user: _.pick(user, ['fullName', 'email'])});
    }
  );
}

module.exports.register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  try {
    const emailRegistration = req.body.email.toLowerCase();

    // Check for project existence and email uniqueness similar to previous examples

    // Create new user
    let user = new Schooluser({
      email: emailRegistration,
      username: emailRegistration,
      project_id: project._id,
      // Additional properties...
    });

    // Generate password and hash
    user.passwordO = makePassword();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.passwordO, salt);
    user.password = hash;
    user.saltSecret = salt;

    // Save user
    await user.save(opts);

    // Prepare email options
    let emailContent = getHtmlRegistrationEmail(user.email, user.passwordO);
    let mailOptions = {
      from: `${project.companyName} <noreply@cateringexpert.de>`,
      bcc: project.emailRegistration || '',
      to: emailRegistration,
      subject: 'Accountinformationen✔',
      html: emailContent
    };

    // Send the email
    const emailResult = await sendRegistrationEmail(mailOptions);
    if (!emailResult.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message: emailResult.message, isError: true });
    }

    // Commit transaction if everything is successful
    await session.commitTransaction();
    session.endSession();
    res.status(201).send({ message: 'Ihr Account wurde erfolgreich angelegt und eine Bestätigung wurde versendet.', isError: false });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({ message: 'Ein Fehler ist aufgetreten bei der Registrierung.', isError: true });
  }
};

const sendRegistrationEmail = async (emailOptions) => {
  try {
    const info = await transporter.sendMail(emailOptions);
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (err) {
    console.error(err);
    if (err.responseCode === 550) {
      return { success: false, message: 'The email address provided is invalid. Please provide a valid email address.' };
    } else {
      return { success: false, message: 'An error occurred while sending the email. Please try again later.' };
    }
  }
}


module.exports.resetPassword = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = makePassword();
    const mailOptions = getEmailResetPassword(username,password);

    // Generating a salt and hashing the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    // Updating the user in the database
    const updatedUser = await Schooluser.findOneAndUpdate(
      { username: username },
      {
        $set: {
          saltSecret: salt,
          password: hash
        }
      },
      { new: true }
    );

    // Check if the username was found and updated
    if (!updatedUser) {
      return res.status(404).send({ message: `Benutzername ${username} wurde nicht gefunden.`, error: true });
    }

    // Sending the reset email
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send({ message: `Password wurde zurückgesetzt. Eine Email mit Ihrem neuen Passwort wurde an ${username} versendet.`, error: false });
  } catch (err) {
    console.error(err); // It's good to log the error for debugging.
    res.status(500).send({ message: 'Es gab ein Fehler beim Zurücksetzen des Passworts.', error: true });
  }
}



