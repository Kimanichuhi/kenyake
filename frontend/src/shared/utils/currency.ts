const formatAmount = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });

export const formatDualCurrency = (amountKes?: number | null, amountUsd?: number | null) => {
  const hasKes = typeof amountKes === "number" && Number.isFinite(amountKes);
  const hasUsd = typeof amountUsd === "number" && Number.isFinite(amountUsd);

  if (hasUsd && hasKes) {
    return `$${formatAmount(amountUsd as number)} / KSh ${formatAmount(amountKes as number)}`;
  }
  if (hasUsd) return `$${formatAmount(amountUsd as number)}`;
  if (hasKes) return `KSh ${formatAmount(amountKes as number)}`;
  return "";
};
