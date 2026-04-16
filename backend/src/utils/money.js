const roundAmount = (value) => Number(Number(value).toFixed(2));

const parseAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? roundAmount(amount) : NaN;
};

const splitByWeightedValues = (amount, values) => {
  const totalCents = Math.round(amount * 100);
  const totalWeight = values.reduce((sum, value) => sum + value, 0);

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return [];
  }

  const shares = values.map((value, index) => {
    const rawCents = (totalCents * value) / totalWeight;

    return {
      index,
      cents: Math.floor(rawCents),
      leftover: rawCents % 1,
    };
  });

  let distributedCents = shares.reduce((sum, item) => sum + item.cents, 0);
  let centsLeft = totalCents - distributedCents;

  shares.sort((a, b) => b.leftover - a.leftover || a.index - b.index);

  for (let index = 0; index < shares.length && centsLeft > 0; index += 1) {
    shares[index].cents += 1;
    centsLeft -= 1;
  }

  shares.sort((a, b) => a.index - b.index);

  return shares.map((item) => roundAmount(item.cents / 100));
};

const splitEqualAmounts = (amount, participantCount) => {
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / participantCount);
  const remainder = totalCents % participantCount;

  return Array.from({ length: participantCount }, (_, index) =>
    roundAmount((index < remainder ? baseCents + 1 : baseCents) / 100)
  );
};

const splitByPercentages = (amount, percentages) => splitByWeightedValues(amount, percentages);

const splitByRatios = (amount, ratios) => splitByWeightedValues(amount, ratios);

module.exports = {
  roundAmount,
  parseAmount,
  splitEqualAmounts,
  splitByPercentages,
  splitByRatios,
};
