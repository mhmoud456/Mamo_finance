import { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

export function ScreenContainer({ children, className, edges = ["top", "left", "right"], ...props }: PropsWithChildren<ViewProps & { className?: string; edges?: Edge[] }>) {
  return <View className="flex-1 bg-background" {...props}><SafeAreaView edges={edges} className={`flex-1 ${className ?? ""}`}>{children}</SafeAreaView></View>;
}
