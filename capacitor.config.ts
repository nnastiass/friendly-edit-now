import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.getoutsocial.app',
  appName: 'GetOut',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
  android: {
      allowMixedContent: true,
      },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    ScreenOrientation: {
      orientation: 'portrait',
    },
  },
};

export default config;
