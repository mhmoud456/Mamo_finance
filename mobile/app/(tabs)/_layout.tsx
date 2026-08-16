import { Tabs } from "expo-router";

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0f766e" }}><Tabs.Screen name="index" options={{ title: "الرئيسية" }} /><Tabs.Screen name="transactions" options={{ title: "المعاملات" }} /><Tabs.Screen name="budgets" options={{ title: "الميزانيات" }} /><Tabs.Screen name="goals" options={{ title: "الأهداف" }} /></Tabs>;
}
