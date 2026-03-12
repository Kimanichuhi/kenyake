const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const MARKETPLACE_COMMISSION_RATE = 0.1;

export const calculateMarketplaceCommission = (grossAmount: number, rate = MARKETPLACE_COMMISSION_RATE) => {
  const safeGross = Number.isFinite(grossAmount) ? grossAmount : 0;
  const safeRate = Number.isFinite(rate) ? rate : MARKETPLACE_COMMISSION_RATE;
  const commission = roundMoney(safeGross * safeRate);
  const sellerPayout = roundMoney(safeGross - commission);

  return {
    gross: roundMoney(safeGross),
    rate: safeRate,
    commission,
    sellerPayout,
  };
};
