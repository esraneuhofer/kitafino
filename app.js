const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
var port = process.env.PORT || 3000;
const path = require('path');

var environment = process.env.NODE_ENV;
var app = express();

var server = require('http').createServer(app);
const mongoose = require('mongoose');
const uri = 'mongodb+srv://esraneuhofer:' + encodeURIComponent('Master@Fischer1808!') + '@cluster0.v2dktqh.mongodb.net/main?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected');
  })
  .catch(err => {
    console.log(err);
  });

require(__dirname + '/server/models/parent-tenant.model');
require(__dirname + '/server/models/student.model');
require(__dirname + '/server/models/settings.model');
require(__dirname + '/server/models/school.model');
require(__dirname + '/server/models/school-user.model');
require(__dirname + '/server/models/user.model');
require(__dirname + '/server/config/config');
require(__dirname + '/server/config/passportConfig');
const rtsIndex = require(__dirname + '/server/routes/index.router');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cors());
app.use(passport.initialize());
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
    app.use(express.static(__dirname + '/dist/easyorder'));
    app.get('/*', function(req,res) {
      res.sendFile(path.join(__dirname+ '/dist/easyorder/index.html'));
    });
    break;
}

server.listen(port, function () {
  console.log('Express server listening on port ' + port);
});
