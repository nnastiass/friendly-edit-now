import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.socialstreak.app',
  appName: 'GetOut',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
  android: {
      allowMixedContent: true,
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
