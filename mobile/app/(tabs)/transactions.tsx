import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "../../components/screen-container";
import { trpc } from "../../lib/trpc";

export default function TransactionsScreen() {
  const query = trpc.transactions.list.useQuery({ limit: 100, sort: "newest" });
  return <ScreenContainer className="p-5"><Text className="text-xs font-semibold uppercase tracking-widest text-primary">Mamo Finance</Text><Text className="mt-1 text-3xl font-bold text-foreground">المعاملات</Text><FlatList className="mt-5" data={query.data ?? []} keyExtractor={item => String(item.id)} ListEmptyComponent={<Text className="mt-8 text-center text-muted">لا توجد معاملات بعد.</Text>} renderItem={({ item }) => <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-surface p-4"><View><Text className="font-semibold text-foreground">{item.note || "معاملة"}</Text><Text className="mt-1 text-xs text-muted">{new Date(item.occurredAt).toLocaleDateString()}</Text></View><Text className={item.type === "INCOME" ? "font-bold text-success" : "font-bold text-error"}>{item.amount} {item.currency}</Text></View>} /></ScreenContainer>;
}
