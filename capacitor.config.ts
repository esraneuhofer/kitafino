import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringexpert.appcateringexpert',
  appName: 'Cateringexpert',
  webDir: 'dist/schulanmeldungen',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',
  },
  // server: {
  //   hostname: 'my-app.com',
  //   androidScheme: 'https',
  //   cleartext: true,
  //   url: 'https://kitafino-45139aec3e10.herokuapp.com'
  //   // url: 'http://localhost:4200/'
  // },
  plugins: {
    "FileOpener": {
      "ios": {
        "usesFileOpener": true
      }
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidSplashResourceName: "splash",  // Referenziert das Splash-Bild für Android
      "androidScaleType": "CENTER_CROP",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
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
