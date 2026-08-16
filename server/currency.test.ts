import { describe, expect, it } from "vitest";
import { BASE_CURRENCY, convertToBaseCurrency, DEFAULT_USD_TO_SYP_RATE } from "./currency";

describe("base currency conversion", () => {
  it("uses SYP as the base and converts USD with the manual rate", () => {
    expect(BASE_CURRENCY).toBe("SYP");
    expect(convertToBaseCurrency(10, "USD", DEFAULT_USD_TO_SYP_RATE)).toBe(1320);
    expect(convertToBaseCurrency(500, "SYP", DEFAULT_USD_TO_SYP_RATE)).toBe(500);
  });

  it("does not invent rates for unsupported currencies", () => {
    expect(convertToBaseCurrency(10, "EUR", DEFAULT_USD_TO_SYP_RATE)).toBeNull();
    expect(convertToBaseCurrency(10, "TRY", DEFAULT_USD_TO_SYP_RATE)).toBeNull();
  });
});
