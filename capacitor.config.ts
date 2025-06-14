import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringexpert.appcateringexpert',
  appName: 'Cateringexpert',
  webDir: 'dist/schulanmeldungen',

  ios: {
    contentInset: 'always',
    scheme: 'cateringexpert'  // Hier benutzerdefiniertes URL-Schema hinzufügen
  },
  // server: {
  //   androidScheme: 'http',
  //   cleartext: false,
  //   url: 'https://essen.cateringexpert.de',
  // },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  // server: {
  //   url: 'http://192.168.2.34:4200', // ERSETZEN Sie diese IP mit Ihrer echten IP!
  //   cleartext: true,
  //   allowNavigation: ['*']
  // "url": "http://10.0.2.2:4200"
  // url: 'http://localhost:4200/'

  // },

  plugins: {
    "Cordova": {},
    "FileOpener": {
      "ios": {
        "usesFileOpener": true
      }
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      // launchAutoHide: false,
      androidSplashResourceName: "splash",  // Referenziert das Splash-Bild für Android
      androidScaleType: "CENTER_CROP",
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

// server: {
//   hostname: 'my-app.com',
//     androidScheme: 'https',
//     cleartext: false,
//   // url: 'https://essen.cateringexpert.de',
//   // url: 'http://localhost:4200/'
//   // "url": "http://10.0.2.2:4200"
// },
