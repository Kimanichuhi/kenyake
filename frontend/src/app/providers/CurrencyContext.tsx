import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Currency = "KES" | "USD";

const KES_PER_USD = 130;

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
  format: (amountKes?: number | null, amountUsd?: number | null) => string;
  rate: number;
};

const CurrencyContext = createContext<Ctx | undefined>(undefined);

const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 2 : 0 });

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "KES";
    return (localStorage.getItem("safarisync.currency") as Currency) || "KES";
  });

  useEffect(() => {
    localStorage.setItem("safarisync.currency", currency);
  }, [currency]);

  const setCurrency = (c: Currency) => setCurrencyState(c);
  const toggle = () => setCurrencyState((c) => (c === "KES" ? "USD" : "KES"));

  const format: Ctx["format"] = (amountKes, amountUsd) => {
    const kes =
      typeof amountKes === "number" && Number.isFinite(amountKes)
        ? amountKes
        : typeof amountUsd === "number" && Number.isFinite(amountUsd)
        ? amountUsd * KES_PER_USD
        : null;
    const usd =
      typeof amountUsd === "number" && Number.isFinite(amountUsd)
        ? amountUsd
        : typeof amountKes === "number" && Number.isFinite(amountKes)
        ? amountKes / KES_PER_USD
        : null;
    if (currency === "KES" && kes !== null) return `KSh ${fmt(kes)}`;
    if (currency === "USD" && usd !== null) return `$${fmt(usd)}`;
    return "";
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggle, format, rate: KES_PER_USD }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
