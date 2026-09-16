import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vedicastrology.app",
  appName: "Vedic Astrology",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    allowNavigation: [
      "*.razorpay.com",
      "*.googleapis.com",
      "myvedicastrology.in",
      "www.myvedicastrology.in",
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: "#080A18",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#080A18",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    backgroundColor: "#080A18",
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: "#080A18",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Vedic Astrology",
  },
};

export default config;
