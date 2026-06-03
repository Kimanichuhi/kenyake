import { useCurrency } from "@/contexts/CurrencyContext";

const CurrencyToggle = ({ dark = false }: { dark?: boolean }) => {
  const { currency, setCurrency } = useCurrency();
  const base = dark
    ? "border-primary-foreground/20 bg-primary-foreground/10"
    : "border-border bg-card";
  const active = dark ? "bg-savannah-gold text-foreground" : "bg-foreground text-background";
  const inactive = dark ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <div className={`inline-flex items-center rounded-full border ${base} p-0.5 text-xs font-medium`}>
      {(["KES", "USD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            currency === c ? active : inactive
          }`}
          aria-label={`Show prices in ${c}`}
        >
          {c === "KES" ? "KSh" : "$"}
        </button>
      ))}
    </div>
  );
};

export default CurrencyToggle;
