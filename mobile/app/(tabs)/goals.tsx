import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "../../components/screen-container";
import { trpc } from "../../lib/trpc";

export default function GoalsScreen() {
  const query = trpc.goals.list.useQuery();
  return <ScreenContainer className="p-5"><Text className="text-xs font-semibold uppercase tracking-widest text-primary">Mamo Finance</Text><Text className="mt-1 text-3xl font-bold text-foreground">الأهداف المالية</Text><FlatList className="mt-5" data={query.data ?? []} keyExtractor={item => String(item.id)} ListEmptyComponent={<Text className="mt-8 text-center text-muted">لا توجد أهداف بعد.</Text>} renderItem={({ item }) => { const percentage = Math.min(100, Number(item.currentAmount) / Number(item.targetAmount) * 100); return <View className="mb-3 rounded-2xl bg-surface p-4"><View className="flex-row justify-between"><Text className="font-semibold text-foreground">{item.name}</Text><Text className="font-bold text-primary">{percentage.toFixed(0)}%</Text></View><Text className="mt-2 text-muted">{item.currentAmount} / {item.targetAmount} {item.currency}</Text><Text className="mt-1 text-xs text-muted">{item.deadline ? new Date(item.deadline).toLocaleDateString() : "بدون موعد"}</Text></View>; }} /></ScreenContainer>;
}
