const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');

const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
    var user = new User();
  user.fullName = req.body.fullName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.username = req.body.email;
  user.tenantUrl = req.body.tenantUrl;
  if(req.body.code !== 'HeinerBolle')  return res.status(422).send(['Netter Versuch Heiner']);
  user.save((err, doc) => {
    if (!err)
      res.send(doc);
    else {
      if (err.code == 11000)
        res.status(422).send(['Duplicate email adrress found.']);
      else
        return next(err);
    }

  });
}

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
  console.log(req._id)
  try {
    const user = await User.findOne({_id: req._id}).exec();

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


