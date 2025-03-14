require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const Schooluser = mongoose.model('Schooluser');
const SchoolNew = mongoose.model('SchoolNew');
const {convertToSendGridFormat} = require('./sendfrid.controller');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const bcrypt = require('bcryptjs');
const {getEmailResetPassword} = require('./email-reset-password')
const {getHtmlRegistrationEmail} = require('./email-registration');
const {getEmailChangePassword} = require('./get-email-body-change-password');

function makePassword() {
  var text = "";
  var possible = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
const User = mongoose.model('User');



module.exports.authenticate = async (req, res, next) => {
  try {
    passport.authenticate('local', async (err, user, info) => {
      if (err) return res.status(400).json(err);
      else if (user) {
        if (user.token && user.token.length > 0) {
          const hasOldFormat = user.token.some(t => typeof t === 'string');
          
          if (hasOldFormat) {
            console.log('Found old token format during login for user ID:', user._id);
            
            // Store old tokens for logging purposes
            const oldTokensCount = user.token.length;
            
            // Create new token array with new structure
            const newTokens = [];
            
            user.token.forEach((oldToken, index) => {
              if (typeof oldToken === 'string') {
                newTokens.push({
                  tokenValue: oldToken,
                  deviceId: `migrated_device_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 10)}`,
                  platform: 'migrated',
                  lastUpdated: new Date()
                });
              } else if (oldToken && oldToken.tokenValue) {
                // Keep tokens that are already in new format
                newTokens.push(oldToken);
              }
            });
            
            // First clear all old tokens, then set the new token array
            await User.findByIdAndUpdate(user._id, 
              { $set: { token: [] } },
              { new: false }
            );
            
            // Now set the new token array
            await User.findByIdAndUpdate(user._id, 
              { $set: { token: newTokens } },
              { new: true }
            );
            
            console.log(`Deleted ${oldTokensCount} old tokens and migrated to ${newTokens.length} new format tokens during login for user ID:`, user._id);
          }
        }
        return res.status(200).json({"token": user.generateJwt()});
      } else return res.status(404).json(info);
    })(req, res);
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
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
    const projectExists  = await SchoolNew.findOne({projectId: req.body.projectId.toLowerCase()}).session(session);
    if(!projectExists){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: "PROJECT_NOT_EXIST", isError: true });
    }
    const existingUser = await Schooluser.findOne({ email: emailRegistration }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message:'EMAIL_ALREADY_REGISTERED', isError: true });
    }

    const user = new Schooluser({
      registrationDate: new Date(),
      email: emailRegistration,
      username: emailRegistration,
      project_id: projectExists._id,
      customerId: projectExists.customerId,
      tenantId: projectExists.tenantId,

    });

    let password = makePassword();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;
    user.saltSecret = salt;

    await user.save(opts);

    const emailContent = getHtmlRegistrationEmail(user.email, password);
    const mailOptions = convertToSendGridFormat({
      from: `Cateringexpert <noreply@cateringexpert.de>`,
      bcc:'monitoring@cateringexpert.de',
      to: emailRegistration,
      subject: 'Accountinformationen✔',
      html: emailContent
    });
    let copy = JSON.parse(JSON.stringify(mailOptions));
    delete copy.html;
    const emailResult = await sendRegistrationEmail(mailOptions);
    if (!emailResult.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message: emailResult.message, isError: true });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).send({ message: 'REGISTRATION_SUCCESS', isError: false });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({ message:'REGISTRATION_ERROR', isError: true });
  }
};

const sendRegistrationEmail = async (emailOptions) => {
  try {
    await sgMail.send(emailOptions);
    return { success: true, message: 'Verifizierungsmail erfolgreich gesendet.' };
  } catch (err) {
    console.error(err);
    if (err.response) {
      console.error('SendGrid error code:', err.response.statusCode);
      console.error('SendGrid error body:', err.response.body);
    } else {
      console.error('Error sending email:', err);
    }
    if (err.code === 550) {
      return { success: false, message: 'Die angegebene E-Mail-Adresse ist ungültig. Bitte geben Sie eine gültige E-Mail-Adresse an.' };
    } else {
      return { success: false, message: 'Beim Senden der E-Mail ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' };
    }
  }
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.deactivateAccount = async (req, res, next) => {
  try {
    const password = makePassword();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const updatedUser = await Schooluser.findOneAndUpdate(
      { _id: req._id },
      {
        $set: {
          saltSecret: salt,
          password: hash
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: `Benutzername ${username} wurde nicht gefunden.`, error: true });
    }

    res.status(200).send({ message: `Account wurde deaktiviert.`, error: false });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Es gab ein Fehler beim Zurücksetzen des Passworts.', error: true });
  }
}


module.exports.changePassword = async (req, res, next) => {
  try {
    const user = await Schooluser.findOne({ _id: req._id });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User record not found.' });
    }

    req.body.email = user.email;
    req.body.password = req.body.oldPassword;

    passport.authenticate('local', async (err, authenticatedUser, info) => {
      if (err) {
        console.error('Passport error:', err);
        return res.status(500).send({ message: "Ein Fehler ist aufgetreten", error: true });
      }

      if (!authenticatedUser) {
        console.error('Authentication failed:', info);
        return res.status(401).send({ message: "Das alte Passwort ist nicht korrekt", error: true });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newPassword, salt);

        await Schooluser.findOneAndUpdate(
          { _id: req._id },
          {
            $set: {
              saltSecret: salt,
              password: hash
            }
          },
          { new: true }
        );

        const mailOptions = convertToSendGridFormat(getEmailChangePassword(user.email));

        await sgMail.send(mailOptions);
        return res.send({ message: 'Password wurde erfolgreich geändert', error: false });
      } catch (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).send({ message: 'Es ist ein Fehler beim Aktualisieren des Passworts aufgetreten', error: true });
      }
    })(req, res, next);
  } catch (findError) {
    console.error('Internal error:', findError);
    return res.status(500).json({ message: 'Ein interner Fehler ist aufgetreten', error: true });
  }
};


module.exports.resetPassword = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = makePassword();
    const mailOptions = getEmailResetPassword(username, password);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const updatedUser = await Schooluser.findOneAndUpdate(
      { username: username },
      {
        $set: {
          saltSecret: salt,
          password: hash,
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: `Benutzername ${username} wurde nicht gefunden.`, error: true });
    }

    await sgMail.send(mailOptions);
    res.status(200).send({ message: `Passwort wurde zurückgesetzt. Eine E-Mail mit Ihrem neuen Passwort wurde an ${username} versendet.`, error: false });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Es gab ein Fehler beim Zurücksetzen des Passworts.', error: true });
  }
}




