import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringexpert.appcateringexpert',
  appName: 'Cateringexpert',
  webDir: 'dist/schulanmeldungen',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',
    splashScreen: {
      showSpinner: true,
      backgroundColor: '#ffffff'
    },
  },
  server: {
    hostname: 'my-app.com',
    androidScheme: 'https',
    cleartext: true,
    url: 'https://kitafino-45139aec3e10.herokuapp.com'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",  // Referenziert das Splash-Bild
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
