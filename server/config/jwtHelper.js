const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.verifyJwtToken = (req, res, next) => {
  var token;
  if ('authorization' in req.headers)
    token = req.headers['authorization'].split(' ')[1];

  if (!token)
    return res.status(403).send({auth: false, message: 'No token provided.'});
  else {
    jwt.verify(token, process.env.JWT_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(500).send({auth: false, message: 'Token authentication failed.'});
        else {
          User.findOne({_id: decoded._id},
            (err, user) => {
              if (!user){
                return res.status(404).json({status: false, message: 'User record not found.'});
              }
              // if (user.isDeactivated){
              //   return res.status(404).json({status: false, message: 'Benutzer ist abgemeldet'});
              // }
              else
                req._id = decoded._id;
                req.tenantId = user.tenantId;
                next();
            }
          );
        }
      }
    )
  }
}

