import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "../components/screen-container";
import { saveSessionToken } from "../lib/session";

export default function OAuthCallback() {
  const params = useLocalSearchParams<{ token?: string }>();
  useEffect(() => { if (params.token) void saveSessionToken(params.token).then(() => router.replace("/(tabs)")); }, [params.token]);
  return <ScreenContainer className="items-center justify-center p-6"><View className="items-center gap-3"><ActivityIndicator color="#0f766e" /><Text className="text-center text-foreground">جارٍ إكمال تسجيل الدخول…</Text></View></ScreenContainer>;
}
