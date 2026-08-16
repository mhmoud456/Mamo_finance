import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "../../components/screen-container";
import { trpc } from "../../lib/trpc";
import { clearLocalPin, setLocalPin, verifyLocalPin } from "../../lib/session";
import { signInWithBrowser, signOutMobile } from "../../lib/auth";


function SecurityModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const changePin = async () => {
    setError("");
    if (!(await verifyLocalPin(oldPin))) return setError("رمز الدخول الحالي غير صحيح.");
    if (!/^\d{4,8}$/.test(newPin)) return setError("استخدم رمزًا جديدًا من 4 إلى 8 أرقام.");
    if (newPin !== confirmation) return setError("الرمزان الجديدان غير متطابقين.");
    await setLocalPin(newPin);
    setOldPin(""); setNewPin(""); setConfirmation(""); onClose();
  };
  const disablePin = async () => { await clearLocalPin(); setOldPin(""); setNewPin(""); setConfirmation(""); onClose(); };
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View className="flex-1 justify-end bg-black/40"><View className="rounded-t-3xl bg-background p-6"><Text className="text-2xl font-bold text-foreground">إدارة قفل التطبيق</Text><Text className="mt-2 text-muted">غيّر رمز الدخول المحلي أو عطّله. جلسة الحساب تبقى محفوظة حتى تسجيل الخروج.</Text><TextInput value={oldPin} onChangeText={setOldPin} keyboardType="number-pad" secureTextEntry placeholder="الرمز الحالي" placeholderTextColor="#94a3b8" className="mt-5 rounded-2xl border border-border px-4 py-4 text-foreground" /><TextInput value={newPin} onChangeText={setNewPin} keyboardType="number-pad" secureTextEntry placeholder="الرمز الجديد" placeholderTextColor="#94a3b8" className="mt-3 rounded-2xl border border-border px-4 py-4 text-foreground" /><TextInput value={confirmation} onChangeText={setConfirmation} keyboardType="number-pad" secureTextEntry placeholder="تأكيد الرمز الجديد" placeholderTextColor="#94a3b8" className="mt-3 rounded-2xl border border-border px-4 py-4 text-foreground" />{error ? <Text className="mt-3 text-error">{error}</Text> : null}<Pressable onPress={() => void changePin()} className="mt-4 rounded-2xl bg-primary p-4"><Text className="text-center font-bold text-primary-foreground">حفظ الرمز الجديد</Text></Pressable><Pressable onPress={() => void disablePin()} className="mt-3 rounded-2xl bg-surface p-4"><Text className="text-center font-bold text-error">تعطيل قفل التطبيق</Text></Pressable><Pressable onPress={onClose} className="mt-3 p-3"><Text className="text-center font-semibold text-muted">إلغاء</Text></Pressable></View></View></Modal>;
}

export default function HomeScreen() {
  const [currency] = useState<"USD" | "EUR" | "GBP" | "TRY" | "SYP">("SYP");
  const [quickText, setQuickText] = useState("");
  const [securityOpen, setSecurityOpen] = useState(false);
  const summary = trpc.dashboard.summary.useQuery({ currency });
  const parsed = trpc.transactions.quickParse.useQuery({ text: quickText }, { enabled: quickText.length > 1 });
  const user = trpc.auth.me.useQuery();
  const amount = parsed.data?.amount;
  const description = parsed.data?.description;
  const dateLabel = useMemo(() => new Date().toLocaleDateString(), []);
  const addQuickExpense = () => { if (!amount || !description) return; };
  const logout = async () => { await signOutMobile(); };
  const reauthenticate = async () => { await signOutMobile(); await signInWithBrowser(); };

  if (user.error) return <ScreenContainer className="items-center justify-center p-6"><Text className="text-3xl font-bold text-foreground">انتهت الجلسة</Text><Text className="mt-3 text-center text-muted">يحتاج التطبيق إلى تسجيل دخول جديد للوصول إلى بياناتك بأمان.</Text><Pressable onPress={() => void reauthenticate()} className="mt-5 rounded-2xl bg-primary px-5 py-4"><Text className="text-center font-bold text-primary-foreground">إعادة تسجيل الدخول</Text></Pressable></ScreenContainer>;
  if (!user.data) return <ScreenContainer className="items-center justify-center p-6"><Text className="text-3xl font-bold text-foreground">Mamo Finance</Text><Text className="mt-3 text-center text-muted">سجّل الدخول بأمان لعرض بياناتك الحقيقية.</Text></ScreenContainer>;
  return <ScreenContainer className="p-5" edges={["top", "left", "right"]}>
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <View className="flex-row items-start justify-between"><View><Text className="text-sm text-muted">{dateLabel}</Text><Text className="mt-1 text-3xl font-bold text-foreground">نظرة عامة</Text></View><Pressable onPress={() => setSecurityOpen(true)}><Text className="font-semibold text-primary">الأمان</Text></Pressable></View>
      <View className="mt-6 rounded-3xl bg-primary p-6"><Text className="text-sm text-primary-foreground/80">الرصيد الحالي</Text><Text className="mt-2 text-4xl font-bold text-primary-foreground">{summary.data ? `${summary.data.balance.toFixed(2)} ${currency}` : "—"}</Text></View>
      <View className="mt-4 flex-row gap-3"><View className="flex-1 rounded-2xl bg-surface p-4"><Text className="text-sm text-muted">الدخل</Text><Text className="mt-2 text-xl font-bold text-success">{summary.data ? `${summary.data.income.toFixed(2)} ${currency}` : "—"}</Text></View><View className="flex-1 rounded-2xl bg-surface p-4"><Text className="text-sm text-muted">المصروف</Text><Text className="mt-2 text-xl font-bold text-error">{summary.data ? `${summary.data.expenses.toFixed(2)} ${currency}` : "—"}</Text></View></View>
      <View className="mt-6 rounded-3xl bg-surface p-5"><Text className="text-lg font-bold text-foreground">إضافة سريعة</Text><TextInput value={quickText} onChangeText={setQuickText} placeholder="25 قهوة" placeholderTextColor="#94a3b8" className="mt-4 rounded-2xl border border-border px-4 py-4 text-foreground" /><Text className="mt-3 text-sm text-muted">{description ? `${amount} — ${description}` : "سيتم استخراج المبلغ والوصف، ثم اختيار الفئة قبل الحفظ."}</Text><Pressable onPress={addQuickExpense} style={({ pressed }) => ({ marginTop: 16, borderRadius: 16, padding: 16, backgroundColor: pressed ? "#0f766e" : "#115e59", opacity: amount ? 1 : 0.5 })}><Text className="text-center font-bold text-white">متابعة وتأكيد الفئة</Text></Pressable></View>
      <Text className="mt-7 text-xl font-bold text-foreground">آخر المعاملات</Text>{(summary.data?.recent ?? []).slice(0, 5).map(row => <View key={row.id} className="mt-3 flex-row items-center justify-between rounded-2xl bg-surface p-4"><View><Text className="font-semibold text-foreground">{row.note || "معاملة"}</Text><Text className="mt-1 text-xs text-muted">{new Date(row.occurredAt).toLocaleDateString()}</Text></View><Text className={row.type === "INCOME" ? "font-bold text-success" : "font-bold text-error"}>{row.type === "INCOME" ? "+" : "−"}{row.amount} {row.currency}</Text></View>)}
      <Pressable onPress={() => void logout()} className="mt-8 rounded-2xl border border-error p-4"><Text className="text-center font-bold text-error">تسجيل الخروج</Text></Pressable>
    </ScrollView><SecurityModal visible={securityOpen} onClose={() => setSecurityOpen(false)} />
  </ScreenContainer>;
}
