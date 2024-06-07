const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
var port = process.env.PORT || 3002;
const path = require('path');
require('dotenv').config();
var environment = process.env.NODE_ENV;
var app = express();
const i18n = require('i18n');
var server = require('http').createServer(app);
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const cookieParser = require('cookie-parser');


app.use(i18n.init);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected');
      // Rufe die Funktion auf, um den neuen Cron-Job zu planen
      scheduleDeleteOldMessages();
      setTaskCustomerDeadline().then(() => {
      console.log('Tasks scheduled successfully.');
    }).catch((error) => {
      console.error('Failed to schedule tasks:', error);
    });
  })
  .catch(err => {
    console.log(err);
  });

app.use('/api', (req, res) => {
  const apiUrl = 'https://kitafino-45139aec3e10.herokuapp.com/api';
  // Leite die Anfrage weiter an den tatsächlichen API-Endpunkt
  // Du kannst hierfür ein Proxy-Tool wie http-proxy-middleware verwenden
  // Einfache Weiterleitung mit http-proxy-middleware
  const { createProxyMiddleware } = require('http-proxy-middleware');
  app.use('/api', createProxyMiddleware({ target: apiUrl, changeOrigin: true }));
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

// Statische Dateien aus dem .well-known Verzeichnis bedienen
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   next();
// });

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
  if (req.path === '/api/webhook') {
    return next();
  }
  bodyParser.json({limit: '50mb'})(req, res, next);
});

app.use(passport.initialize());
const rtsIndex = require(__dirname + '/server/routes/index.router');
app.use('/api', rtsIndex);

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
