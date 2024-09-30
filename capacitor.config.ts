import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringexpert.appcateringexpert',
  appName: 'Cateringexpert',
  // webDir: 'dist/schulanmeldungen',
  bundledWebRuntime: false,

  ios: {
    contentInset: 'always',
    scheme: 'cateringexpert'  // Hier benutzerdefiniertes URL-Schema hinzufügen
  },
  server: {
    // Entferne hostname, wenn du server.url verwendest
    // hostname: 'my-app.com',
    androidScheme: 'https',
    // Setze cleartext auf false, wenn du HTTPS verwendest
    cleartext: false,
    url: 'https://essen.cateringexpert.de',  // Ersetze dies mit der tatsächlichen URL deiner Heroku-App
  },
  plugins: {
    "Cordova": {},
    "FileOpener": {
      "ios": {
        "usesFileOpener": true
      }
    },
    SplashScreen: {
      launchAutoHide: false,
      androidSplashResourceName: "splash",  // Referenziert das Splash-Bild für Android
      "androidScaleType": "CENTER_CROP",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: true,
      // iOS spezifische Einstellungen

      backgroundColor: "#ffffff",
      showSpinner: false,
    }
  }
};

export default config;
// cleartext: true,
// // url: 'https://essen.cateringexpert.de',
// // url: 'http://localhost:4200/'
// // "url": "http://10.0.2.2:4200"
// },
