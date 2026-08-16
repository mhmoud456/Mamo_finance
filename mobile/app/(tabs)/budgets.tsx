import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "../../components/screen-container";
import { trpc } from "../../lib/trpc";

export default function BudgetsScreen() {
  const query = trpc.budgets.list.useQuery({ month: new Date().toISOString().slice(0, 7), currency: "SYP" });
  return <ScreenContainer className="p-5"><Text className="text-xs font-semibold uppercase tracking-widest text-primary">Mamo Finance</Text><Text className="mt-1 text-3xl font-bold text-foreground">الميزانيات</Text><FlatList className="mt-5" data={query.data ?? []} keyExtractor={item => String(item.id)} ListEmptyComponent={<Text className="mt-8 text-center text-muted">لا توجد ميزانيات بعد.</Text>} renderItem={({ item }) => { const percentage = Math.min(100, (item.spent / Number(item.amount)) * 100); return <View className="mb-3 rounded-2xl bg-surface p-4"><View className="flex-row justify-between"><Text className="font-semibold text-foreground">{item.name}</Text><Text className="font-bold text-primary">{percentage.toFixed(0)}%</Text></View><Text className="mt-2 text-muted">{item.spent} / {item.amount} {item.currency}</Text></View>; }} /></ScreenContainer>;
}
