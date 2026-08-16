import * as Crypto from "expo-crypto";
import { DeviceEventEmitter } from "react-native";
import { createPinRecord, saveToken, readToken, clearToken, verifyPinRecord } from "./session-core";

export const SESSION_KEY = "sarfati_session_token";
const SETTINGS_KEY = "sarfati_settings";
const LOCK_KEY = "mamo_local_lock";
const PIN_SETUP_KEY = "mamo_pin_setup_dismissed";
export const SESSION_CHANGED_EVENT = "mamo-session-changed";

export type LocalLockRecord = { salt: string; hash: string; rounds: number };

const canUseWebStorage = typeof document !== "undefined";

async function readValue(key: string) {
  if (canUseWebStorage) return globalThis.localStorage.getItem(key);
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string) {
  if (canUseWebStorage) { globalThis.localStorage.setItem(key, value); return; }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(key, value);
}

async function deleteValue(key: string) {
  if (canUseWebStorage) { globalThis.localStorage.removeItem(key); return; }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(key);
}

const storage = { get: readValue, set: writeValue, remove: deleteValue };
export async function getSessionToken() { return readToken(storage, SESSION_KEY); }
export async function saveSessionToken(token: string) {
  await saveToken(storage, SESSION_KEY, token);
  DeviceEventEmitter.emit(SESSION_CHANGED_EVENT);
}
export async function clearSessionToken() {
  await clearToken(storage, SESSION_KEY);
  DeviceEventEmitter.emit(SESSION_CHANGED_EVENT);
}

export async function getLocalSettings<T extends object>() {
  const value = await readValue(SETTINGS_KEY);
  return value ? JSON.parse(value) as T : null;
}
export async function saveLocalSettings(value: object) {
  return writeValue(SETTINGS_KEY, JSON.stringify(value));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function digest(value: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value, { encoding: Crypto.CryptoEncoding.HEX });
}

export async function getLocalLock() {
  const value = await readValue(LOCK_KEY);
  return value ? JSON.parse(value) as LocalLockRecord : null;
}

export async function hasLocalPin() { return Boolean(await getLocalLock()); }

export async function setLocalPin(pin: string) {
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const record = await createPinRecord(pin, salt, digest);
  await writeValue(LOCK_KEY, JSON.stringify(record satisfies LocalLockRecord));
  await deleteValue(PIN_SETUP_KEY);
}

export async function verifyLocalPin(pin: string) {
  const lock = await getLocalLock();
  if (!lock) return true;
  return verifyPinRecord(pin, lock, digest);
}

export async function clearLocalPin() {
  await deleteValue(LOCK_KEY);
  await deleteValue(PIN_SETUP_KEY);
}

export async function isPinSetupDismissed() { return (await readValue(PIN_SETUP_KEY)) === "true"; }
export async function dismissPinSetup() { return writeValue(PIN_SETUP_KEY, "true"); }
export function notifySessionChanged() { DeviceEventEmitter.emit(SESSION_CHANGED_EVENT); }
