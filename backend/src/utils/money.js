const roundAmount = (value) => Number(Number(value).toFixed(2));

const parseAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? roundAmount(amount) : NaN;
};

const splitEqualAmounts = (amount, participantCount) => {
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / participantCount);
  const remainder = totalCents % participantCount;

  return Array.from({ length: participantCount }, (_, index) =>
    roundAmount((index < remainder ? baseCents + 1 : baseCents) / 100)
  );
};

module.exports = {
  roundAmount,
  parseAmount,
  splitEqualAmounts,
};
