import { isValidPin } from "./pin";

export type SessionStorage = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

export type PinRecord = { salt: string; hash: string; rounds: number };

export async function saveToken(storage: SessionStorage, key: string, token: string) {
  await storage.set(key, token);
}

export async function readToken(storage: SessionStorage, key: string) {
  return storage.get(key);
}

export async function clearToken(storage: SessionStorage, key: string) {
  await storage.remove(key);
}

async function derivePinHash(pin: string, salt: string, digest: (value: string) => Promise<string>, rounds: number) {
  let value = `${salt}:${pin}`;
  for (let index = 0; index < rounds; index += 1) value = await digest(value);
  return value;
}

export async function createPinRecord(pin: string, salt: string, digest: (value: string) => Promise<string>, rounds = 1200) {
  const normalized = pin.trim();
  if (!isValidPin(normalized)) throw new Error("PIN must contain 4 to 8 digits");
  return { salt, hash: await derivePinHash(normalized, salt, digest, rounds), rounds } satisfies PinRecord;
}

export async function verifyPinRecord(pin: string, record: PinRecord, digest: (value: string) => Promise<string>) {
  return (await derivePinHash(pin.trim(), record.salt, digest, record.rounds)) === record.hash;
}
