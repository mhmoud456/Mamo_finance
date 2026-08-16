export const BASE_CURRENCY = "SYP" as const;
export const DEFAULT_USD_TO_SYP_RATE = 132;

export function convertToBaseCurrency(amount: number, currency: string, usdToSypRate: number) {
  if (currency === BASE_CURRENCY) return amount;
  if (currency === "USD") return amount * usdToSypRate;
  return null;
}

export function supportsBaseConversion(currency: string) {
  return currency === BASE_CURRENCY || currency === "USD";
}
