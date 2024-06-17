import { CapacitorConfig } from '@capacitor/cli';
import { env } from 'process';
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
    url: env.NODE_ENV === 'production' ? 'https://kitafino-45139aec3e10.herokuapp.com' : 'http://localhost:3002',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
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
