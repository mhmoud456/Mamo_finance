import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  owner: "mhmoudmamo",
  name: "Mamo Finance",
  slug: "sarfati",
  version: "1.0.5",
  orientation: "portrait",
  scheme: "sarfati",
  userInterfaceStyle: "automatic",
  icon: "./assets/mamo-icon-1024.png",
  newArchEnabled: true,
  experiments: { typedRoutes: true },
  plugins: ["expo-secure-store", "expo-web-browser"],
  android: { package: "com.sarfati.finance", versionCode: 7, adaptiveIcon: { foregroundImage: "./assets/mamo-icon-1024.png", backgroundColor: "#F6FAF9" } },
  ios: { bundleIdentifier: "com.sarfati.finance", supportsTablet: true },
  web: { bundler: "metro" },
  extra: {
    apiUrl: "https://financemgr-5wcippfv.manus.space",
    oauthPortalUrl: "https://manus.im/app-auth",
    appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
    eas: { projectId: "c7fa6b4d-f8dd-47ea-b531-c72187566c17" },
  },
};

export default config;
