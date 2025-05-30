const express = require("express");

const path = require("path");
var app = express();
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
var port = process.env.PORT || 3002;
require("dotenv").config();
var environment = process.env.NODE_ENV;
// const i18n = require('i18n');
var server = require("http").createServer(app);
const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;
const cookieParser = require("cookie-parser");
//
//
// i18n.configure({
//   locales: ['en', 'de', 'tr', 'ar', 'pl', 'ru', 'it', 'el', 'es', 'ro', 'nl'],
//   directory: path.join(__dirname, '/server/locales'),
//   defaultLocale: 'de',
//   queryParameter: 'lang',
//   cookie: 'lang',
// });
// app.use(i18n.init);

// Middleware für statische Dateien so früh wie möglich einfügen

const uriTest =
  "mongodb+srv://esraneuhofer:4kBhUIRKG10CRdaG@cluster0.99ewn.mongodb.net/test?retryWrites=true&w=majority";

mongoose
  .connect(uri) // Mongoose 6+ hat diese Optionen standardmäßig aktiviert
  .then(async () => {
    console.log("Connected to MongoDB");

    // Optional: Besseres Error Handling für die Connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful Shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    // Optional: Sie könnten hier auch process.exit(1) hinzufügen,
    // wenn Sie möchten, dass die App bei Verbindungsfehlern stoppt
  });
// CORS configuration
const corsOptions = {
  origin: [
    "http://192.168.2.34:4200", // Lokale IP-Adresse für Angular-Entwicklung
    "http://localhost:4200", // Angular development server
    "capacitor://localhost",
    "http://10.0.2.2:4200", // Capacitor app scheme
    "capacitor://my-app.com",
    "https://my-app.com",
    "http://localhost", // Localhost for Capacitor on Android
    "ionic://localhost", // Ionic scheme for iOS Capacitor apps
    "https://essen.cateringexpert.de", // Deine Produktionsdomain
    "https://mittagessentest-19339973abd7.herokuapp.com",
    "https://cateringexpert.de", // Weitere relevante Domains
  ],
  credentials: true,
};

app.use(cors(corsOptions));

require(__dirname + "/server/models/error_report.model");
require(__dirname + "/server/models/action_log.model");
require(__dirname + "/server/models/feedback.model");
require(__dirname + "/server/models/vacation-student.model");
require(__dirname + "/server/models/buchungskonto.model");
require(__dirname + "/server/models/school.model");
require(__dirname + "/server/models/withdrawrequest.model");
require(__dirname + "/server/models/help.model");
require(__dirname + "/server/models/but.model");
require(__dirname + "/server/models/but_document.model");
require(__dirname + "/server/models/message.model");
require(__dirname + "/server/models/session-info.model");
require(__dirname + "/server/models/permanent-order.model");
require(__dirname + "/server/models/weekplan.model");
require(__dirname + "/server/models/orders_account.model");
require(__dirname + "/server/models/weekplan_group.model");
require(__dirname + "/server/models/weekplan-group-selection.model");
require(__dirname + "/server/models/order_student.model");
require(__dirname + "/server/models/order_student_cancel.model");
require(__dirname + "/server/models/assigned_weekplan.model");
require(__dirname + "/server/models/charge_account.model");
require(__dirname + "/server/models/account.model");
require(__dirname + "/server/models/article_declaration");
require(__dirname + "/server/models/article_edited.model");
require(__dirname + "/server/models/customer.model");
require(__dirname + "/server/models/meal.model");
require(__dirname + "/server/models/menu.model");
require(__dirname + "/server/models/order.model");
require(__dirname + "/server/models/parent-tenant.model");
require(__dirname + "/server/models/school.model");
require(__dirname + "/server/models/school-user.model");
require(__dirname + "/server/models/settings.model");
require(__dirname + "/server/models/student.model");
require(__dirname + "/server/models/user.model");
require(__dirname + "/server/models/vacation.model");
require(__dirname + "/server/models/weekplan_add.model");
require(__dirname + "/server/config/config");
require(__dirname + "/server/config/passportConfig");

app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use((req, res, next) => {
  if (req.path === "/api/webhook") {
    return next();
  }
  bodyParser.json({ limit: "50mb" })(req, res, next);
});

// Dynamische Anpassung der apiBaseUrl basierend auf der Umgebung und dem User-Agent
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const userAgent = req.headers["user-agent"];
    if (userAgent && userAgent.includes("Capacitor")) {
      req.apiBaseUrl = "https://essen.cateringexpert.de/api";
    } else {
      req.apiBaseUrl = "/api";
    }
    // console.log('apiBaseUrl:', req.apiBaseUrl);
    next();
  });
} else {
  // Für localhost und andere Umgebungen
  app.use((req, res, next) => {
    req.apiBaseUrl = "/api";
    next();
  });
}

app.use(passport.initialize());
const rtsIndex = require(__dirname + "/server/routes/index.router");
app.use(
  "/api",
  (req, res, next) => {
    req.baseUrl = req.apiBaseUrl;
    next();
  },
  rtsIndex
);

// app.use('/api', rtsIndex);
// error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  } else {
    console.log(err);
  }
});

switch (environment) {
  case "production":
    app.use(express.static(__dirname + "/dist/schulanmeldungen"));
    app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname + "/dist/schulanmeldungen/index.html"));
    });
    break;
}

server.listen(port, function () {
  console.log("Express server listening on port " + port);
});
