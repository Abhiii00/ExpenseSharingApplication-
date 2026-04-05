const { roundAmount } = require("./money");

const buildNetBalancesMap = (expenses) => {
  const netMap = new Map();

  const ensureUser = (user) => {
    if (!netMap.has(user.userId)) {
      netMap.set(user.userId, {
        userId: user.userId,
        name: user.name,
        balance: 0,
      });
    }

    return netMap.get(user.userId);
  };

  expenses.forEach((expense) => {
    ensureUser(expense.payer).balance = roundAmount(ensureUser(expense.payer).balance + expense.amount);

    expense.participants.forEach((participant) => {
      ensureUser(participant).balance = roundAmount(
        ensureUser(participant).balance - participant.share
      );
    });
  });

  return netMap;
};

const getBalancesFromExpenses = (expenses) => {
  const pairMap = new Map();

  expenses.forEach((expense) => {
    expense.participants.forEach((participant) => {
      if (participant.userId === expense.payer.userId || participant.share === 0) {
        return;
      }

      const forwardKey = `${participant.userId}->${expense.payer.userId}`;
      const reverseKey = `${expense.payer.userId}->${participant.userId}`;

      if (pairMap.has(reverseKey)) {
        const reverseEntry = pairMap.get(reverseKey);
        reverseEntry.amount = roundAmount(reverseEntry.amount - participant.share);

        if (reverseEntry.amount <= 0) {
          pairMap.delete(reverseKey);

          if (reverseEntry.amount < 0) {
            pairMap.set(forwardKey, {
              from: { userId: participant.userId, name: participant.name },
              to: { userId: expense.payer.userId, name: expense.payer.name },
              amount: roundAmount(Math.abs(reverseEntry.amount)),
            });
          }
        }

        return;
      }

      const entry = pairMap.get(forwardKey) || {
        from: { userId: participant.userId, name: participant.name },
        to: { userId: expense.payer.userId, name: expense.payer.name },
        amount: 0,
      };

      entry.amount = roundAmount(entry.amount + participant.share);
      pairMap.set(forwardKey, entry);
    });
  });

  const summary = Array.from(pairMap.values()).map((entry) => ({
    from: entry.from,
    to: entry.to,
    amount: roundAmount(entry.amount),
    summary: `${entry.from.name} owes ${entry.to.name} Rs ${roundAmount(entry.amount).toFixed(2)}`,
  }));

  const netBalances = Array.from(buildNetBalancesMap(expenses).values())
    .filter((user) => user.balance !== 0)
    .sort((a, b) => b.balance - a.balance)
    .map((user) => ({
      userId: user.userId,
      name: user.name,
      balance: roundAmount(user.balance),
      status: user.balance > 0 ? "get_back" : "owes",
    }));

  return { summary, netBalances };
};

const settleDebts = (balances) => {
  const creditors = balances
    .filter((entry) => entry.balance > 0)
    .map((entry) => ({ ...entry }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((entry) => entry.balance < 0)
    .map((entry) => ({
      ...entry,
      balance: roundAmount(Math.abs(entry.balance)),
    }))
    .sort((a, b) => b.balance - a.balance);

  const settlements = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = roundAmount(Math.min(creditor.balance, debtor.balance));

    settlements.push({
      from: { userId: debtor.userId, name: debtor.name },
      to: { userId: creditor.userId, name: creditor.name },
      amount,
    });

    creditor.balance = roundAmount(creditor.balance - amount);
    debtor.balance = roundAmount(debtor.balance - amount);

    if (creditor.balance === 0) {
      creditorIndex += 1;
    }

    if (debtor.balance === 0) {
      debtorIndex += 1;
    }
  }

  return settlements;
};

const getSettlementsFromExpenses = (expenses) => {
  const netBalances = Array.from(buildNetBalancesMap(expenses).values()).filter(
    (user) => user.balance !== 0
  );

  const settlements = settleDebts(netBalances).map((entry) => ({
    from: entry.from,
    to: entry.to,
    amount: roundAmount(entry.amount),
    summary: `${entry.from.name} pays ${entry.to.name} Rs ${roundAmount(entry.amount).toFixed(2)}`,
  }));

  return {
    totalTransactions: settlements.length,
    settlements,
  };
};

module.exports = {
  getBalancesFromExpenses,
  getSettlementsFromExpenses,
};
