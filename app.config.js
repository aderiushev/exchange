const packageJson = require('./package.json');

module.exports = {
  expo: {
    name: "Exchange",
    slug: "exchange",
    version: packageJson.version,
    platforms: ["ios", "android"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#111827"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.aderiushev.exchange",
      googleServicesFile: "./config/firebase/GoogleService-Info.plist",
      infoPlist: { ITSAppUsesNonExemptEncryption: false }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#007AFF"
      },
      package: "com.aderiushev.exchange",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      googleServicesFile: "./config/firebase/google-services.json"
    },
    plugins: [
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "buildReactNativeFromSource": true
          }
        }
      ]
    ],
    extra: {
      eas: { projectId: "4ba70427-c166-454d-afae-1ec6cd2b81c9" }
    },
    owner: "aderushev",

    runtimeVersion: { policy: "appVersion" },
    updates: { url: "https://u.expo.dev/4ba70427-c166-454d-afae-1ec6cd2b81c9" },



  }
};

