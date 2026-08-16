import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcLink } from "../lib/trpc";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "../components/screen-container";
import { signInWithBrowser } from "../lib/auth";
import { SESSION_CHANGED_EVENT, clearSessionToken, dismissPinSetup, getLocalLock, getSessionToken, isPinSetupDismissed, setLocalPin, verifyLocalPin } from "../lib/session";
import { DeviceEventEmitter } from "react-native";

function ActionButton({ label, onPress, muted = false }: { label: string; onPress: () => void; muted?: boolean }) {
  return <Pressable onPress={onPress} className={`mt-4 rounded-2xl px-5 py-4 ${muted ? "bg-surface" : "bg-primary"}`}><Text className={`text-center font-bold ${muted ? "text-foreground" : "text-primary-foreground"}`}>{label}</Text></Pressable>;
}

function LoginGate({ onSignedIn }: { onSignedIn: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = async () => { setLoading(true); setError(""); try { if (await signInWithBrowser()) onSignedIn(); else setError("لم يكتمل تسجيل الدخول. حاول مرة أخرى."); } catch { setError("تعذر فتح تسجيل الدخول. تأكد من اتصال الإنترنت ثم حاول مرة أخرى."); } finally { setLoading(false); } };
  return <ScreenContainer className="items-center justify-center p-6"><Text className="text-3xl font-bold text-foreground">Mamo Finance</Text><Text className="mt-3 text-center text-muted">سجّل الدخول مرة واحدة، وسيبقى محفوظًا على هذا الهاتف حتى تختار تسجيل الخروج.</Text>{error ? <Text className="mt-4 text-center text-error">{error}</Text> : null}<ActionButton label={loading ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول الآمن"} onPress={() => void login()} /></ScreenContainer>;
}

function PinSetupGate({ onComplete }: { onComplete: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const save = async () => { if (!/^\d{4,8}$/.test(pin)) return setError("استخدم رمزًا من 4 إلى 8 أرقام."); if (pin !== confirmation) return setError("الرمزان غير متطابقين."); await setLocalPin(pin); onComplete(); };
  const skip = async () => { await dismissPinSetup(); onComplete(); };
  return <ScreenContainer className="justify-center p-6"><Text className="text-3xl font-bold text-foreground">حماية التطبيق</Text><Text className="mt-3 text-muted">اختياري: أنشئ رمز PIN محليًا لفتح التطبيق بسرعة. لا يتم حفظ الرمز نفسه، بل تجزئة آمنة داخل التخزين المحمي.</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry placeholder="رمز من 4 إلى 8 أرقام" placeholderTextColor="#94a3b8" className="mt-6 rounded-2xl border border-border px-4 py-4 text-foreground" /><TextInput value={confirmation} onChangeText={setConfirmation} keyboardType="number-pad" secureTextEntry placeholder="تأكيد الرمز" placeholderTextColor="#94a3b8" className="mt-3 rounded-2xl border border-border px-4 py-4 text-foreground" />{error ? <Text className="mt-3 text-error">{error}</Text> : null}<ActionButton label="حفظ رمز الدخول" onPress={() => void save()} /><ActionButton label="لاحقًا" muted onPress={() => void skip()} /></ScreenContainer>;
}

function UnlockGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const unlock = async () => { if (await verifyLocalPin(pin)) { setPin(""); onUnlocked(); } else setError("رمز الدخول غير صحيح."); };
  return <ScreenContainer className="justify-center p-6"><Text className="text-3xl font-bold text-foreground">مرحبًا بعودتك</Text><Text className="mt-3 text-muted">أدخل رمز الدخول المحلي لفتح Mamo Finance.</Text><TextInput autoFocus value={pin} onChangeText={setPin} onSubmitEditing={() => void unlock()} keyboardType="number-pad" secureTextEntry placeholder="رمز الدخول" placeholderTextColor="#94a3b8" className="mt-6 rounded-2xl border border-border px-4 py-4 text-foreground" />{error ? <Text className="mt-3 text-error">{error}</Text> : null}<ActionButton label="فتح التطبيق" onPress={() => void unlock()} /></ScreenContainer>;
}

function SessionValidation({ onInvalid }: { onInvalid: () => void }) {
  const user = trpc.auth.me.useQuery(undefined, { retry: false });
  useEffect(() => { if (user.error) { void clearSessionToken(); onInvalid(); } }, [user.error, onInvalid]);
  if (user.data) return <Stack screenOptions={{ headerShown: false }} />;
  return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#0f766e" /><Text className="mt-3 text-muted">جارٍ التحقق من الجلسة…</Text></ScreenContainer>;
}

function AuthGate() {
  const [state, setState] = useState<"loading" | "login" | "setup" | "unlock" | "ready">("loading");
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => trpc.createClient({ links: [trpcLink] }));
  const bootstrap = async () => { const token = await getSessionToken(); if (!token) return setState("login"); const lock = await getLocalLock(); if (lock) return setState("unlock"); if (!(await isPinSetupDismissed())) return setState("setup"); setState("ready"); };
  useEffect(() => { void bootstrap(); const subscription = DeviceEventEmitter.addListener(SESSION_CHANGED_EVENT, () => void bootstrap()); const appState = AppState.addEventListener("change", next => { if (next === "active") void getLocalLock().then(lock => { if (lock) setState(current => current === "ready" ? "unlock" : current); }); }); return () => { subscription.remove(); appState.remove(); }; }, []);
  const content = state === "loading" ? <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#0f766e" /></ScreenContainer> : state === "login" ? <LoginGate onSignedIn={() => void bootstrap()} /> : state === "setup" ? <PinSetupGate onComplete={() => void bootstrap()} /> : state === "unlock" ? <UnlockGate onUnlocked={() => setState("ready")} /> : state === "ready" ? <SessionValidation onInvalid={() => setState("login")} /> : <Stack screenOptions={{ headerShown: false }} />;
  return <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}>{content}</QueryClientProvider></trpc.Provider>;
}

export default function RootLayout() { return <AuthGate />; }
