import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringexpert.appcateringexpert',
  appName: 'Cateringexpert',
  webDir: 'dist/schulanmeldungen',
  bundledWebRuntime: false,

  ios: {
    contentInset: 'always',
    scheme: 'cateringexpert'  // Hier benutzerdefiniertes URL-Schema hinzufügen
  },
  server: {
    hostname: 'my-app.com',
    androidScheme: 'https',
    cleartext: true,
    // url: 'https://essen.cateringexpert.de',
    // url: 'http://localhost:4200/'
  },
  plugins: {
    "Cordova": {},
    "FileOpener": {
      "ios": {
        "usesFileOpener": true
      }
    },
    SplashScreen: {
      launchShowDuration: 4000,
      launchAutoHide: true,
      androidSplashResourceName: "splash",  // Referenziert das Splash-Bild für Android
      "androidScaleType": "CENTER_CROP",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: false,
      splashImmersive: true,
      // iOS spezifische Einstellungen
      iosSplashResourceName: "LaunchScreen", // Referenziert das LaunchScreen.storyboard
      iosScaleType: "CENTER_CROP",
      showSpinner: true,
      backgroundColor: "#ffffff"
    }
  }
};

export default config;
