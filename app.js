const express = require('express');

const path = require('path');
var app = express();
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));


const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
var port = process.env.PORT || 3002;
require('dotenv').config();
var environment = process.env.NODE_ENV;
const i18n = require('i18n');
var server = require('http').createServer(app);
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');


// Middleware für statische Dateien so früh wie möglich einfügen


  app.use(i18n.init);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Fiktive req und res Objekte für den Funktionsaufruf
      const req = {}; // Füge notwendige req Eigenschaften hinzu
      const res = {
        status: (statusCode) => ({
          send: (message) => console.log(`Response: ${statusCode}, Message:`, message)
        })
      };

      // await testing(req, res);
      // await testingDaily(req, res);
      // Rufe die Funktion auf, um den neuen Cron-Job zu planen
      scheduleDeleteOldMessages();

      await setTaskCustomerDeadline();
      console.log('Tasks scheduled successfully.');
    } catch (error) {
      console.error('Failed to execute tasks:', error);
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });


// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:4200',           // Angular development server
    'capacitor://localhost',           // Capacitor app scheme
    'https://kitafino-45139aec3e10.herokuapp.com', // Heroku production URL
  ],
  credentials: true,
};


app.use(cors(corsOptions));


// Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   next();
// });

require(__dirname + '/server/models/help.model');
require(__dirname + '/server/models/message.model');
require(__dirname + '/server/models/task-order.model');
require(__dirname + '/server/models/session-info.model');
require(__dirname + '/server/models/permanent-order.model');
require(__dirname + '/server/models/weekplan.model');
require(__dirname + '/server/models/transaction.model');
require(__dirname + '/server/models/orders_account.model');
require(__dirname + '/server/models/weekplan_group.model');
require(__dirname + '/server/models/order_student.model');
require(__dirname + '/server/models/assigned_weekplan.model');
require(__dirname + '/server/models/charge_account.model');
require(__dirname + '/server/models/account.model');
require(__dirname + '/server/models/article_declaration');
require(__dirname + '/server/models/article_edited.model');
require(__dirname + '/server/models/customer.model');
require(__dirname + '/server/models/meal.model');
require(__dirname + '/server/models/menu.model');
require(__dirname + '/server/models/order.model');
// require(__dirname + '/server/models/order.model');
require(__dirname + '/server/models/parent-tenant.model');
require(__dirname + '/server/models/school.model');
require(__dirname + '/server/models/school-user.model');
require(__dirname + '/server/models/settings.model');
require(__dirname + '/server/models/student.model');
require(__dirname + '/server/models/user.model');
require(__dirname + '/server/models/vacation.model');
require(__dirname + '/server/models/weekplan_add.model');
require(__dirname + '/server/config/config');
require(__dirname + '/server/config/passportConfig');
// app.use(bodyParser.urlencoded({
//   limit: '50mb',
//   extended: true
// }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

i18n.configure({
    locales: ['en', 'de', 'tr', 'ar', 'pl', 'ru', 'it', 'el', 'es', 'ro', 'nl'],
    directory: path.join(__dirname, '/server/locales'),
    defaultLocale: 'de',
    queryParameter: 'lang',
    cookie: 'lang',
});
app.use(i18n.init);

app.use((req, res, next) => {
  const lang = req.cookies.lang; // Sprache aus dem Cookie auslesen
  if (lang) {
    i18n.setLocale(lang); // Locale auf die gespeicherte Sprache setzen
  } else {
    i18n.setLocale(i18n.getLocale()); // Standard-Sprache setzen
  }
  next();
});

app.use((req, res, next) => {
  if (req.path === '/api/webhook') {
    return next();
  }
  bodyParser.json({limit: '50mb'})(req, res, next);
});

// Dynamische Anpassung der apiBaseUrl basierend auf der Umgebung und dem User-Agent
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (userAgent && userAgent.includes('Capacitor')) {
      req.apiBaseUrl = 'https://kitafino-45139aec3e10.herokuapp.com/api';
    } else {
      req.apiBaseUrl = '/api';
    }
    // console.log('apiBaseUrl:', req.apiBaseUrl);
    next();
  });
} else {
  // Für localhost und andere Umgebungen
  app.use((req, res, next) => {
    req.apiBaseUrl = '/api';
    next();
  });
}

app.use(passport.initialize());
const rtsIndex = require(__dirname + '/server/routes/index.router');
app.use('/api', (req, res, next) => {
  req.baseUrl = req.apiBaseUrl;
  next();
}, rtsIndex);

// app.use('/api', rtsIndex);
// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
    else{
        console.log(err);
    }
});
switch (environment) {
  case 'production':
    app.use(express.static(__dirname + '/dist/schulanmeldungen'));
    app.get('/*', function(req,res) {
      res.sendFile(path.join(__dirname+ '/dist/schulanmeldungen/index.html'));
    });
    break;
}

server.listen(port, function () {
  console.log('Express server listening on port ' + port);
});


const { setTaskCustomerDeadline } = require(__dirname + '/server/controllers/daily-deadline-task');
const { scheduleDeleteOldMessages } = require(__dirname + '/server/controllers/message.controller');
// const { testing } = require(__dirname + '/server/controllers/task-weekly-order-deadline');
// const { testingDaily } = require(__dirname + '/server/controllers/task-daily-deadline.controller');
