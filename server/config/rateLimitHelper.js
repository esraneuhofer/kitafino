const MAX_LOGIN_ATTEMPTS = 5; // Maximum number of login attempts allowed
const WINDOW_DURATION = 60 * 1000; // Time window in milliseconds
const BAN_DURATION = 10 * 60 * 1000; // Ban duration in milliseconds

const loginAttempts = {};
module.exports.rateLimit = (req, res, next) => {
  const ip = req.ip;
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = [];
  }

  const currentWindow = loginAttempts[ip].filter(
    time => Date.now() - time < WINDOW_DURATION
  );

  if (currentWindow.length >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ message: 'Zu viele Versuche. Aus Sicherheitsgründen ist das einloggen für 10 Minuten gesperrt.' });
  }

  loginAttempts[ip].push(Date.now());
  next();
};

// Middleware to check if the IP is banned
module.exports.checkBan = (req, res, next) => {
  const ip = req.ip;

  if (loginAttempts[ip] && loginAttempts[ip].length >= MAX_LOGIN_ATTEMPTS) {
    const lastAttempt = loginAttempts[ip][loginAttempts[ip].length - 1];
    if (Date.now() - lastAttempt < BAN_DURATION) {
      return res.status(403).json({ message: 'IP banned. Bitte in 10 Minuten wieder versuchen.'});
    }
  }

  next();
};
