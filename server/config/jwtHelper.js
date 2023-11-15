const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schooluser = mongoose.model('Schooluser');

module.exports.verifyJwtToken = async (req, res, next) => {
  try {
    let token;
    if ('authorization' in req.headers) {
      token = req.headers['authorization'].split(' ')[1];
    }

    if (!token) {
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Schooluser.findOne({ _id: decoded._id });

      if (!user) {
        return res.status(404).json({ status: false, message: 'User record not found.' });
      } else {
        req._id = decoded._id;
        req.tenantId = user.tenantId;
        req.customerId = user.customerId;
        req.project_id = user.project_id;
        next();
      }
    }
  } catch (err) {
    return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
  }
};
