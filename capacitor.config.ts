
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.socialstreak.app',
  appName: 'GetOut',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
