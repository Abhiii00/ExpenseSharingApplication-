import Expense from "../models/expenseModel.js";
import User from "../models/userModel.js";
import { parseAmount, roundAmount, splitEqualAmounts } from "../utils/money.js";
import { EXPENSE } from "../utils/msgResponse.js";
import { getBalancesFromExpenses, getSettlementsFromExpenses } from "../utils/settlementHelpers.js";

const buildUserMap = (users) => new Map(users.map((user) => [user._id.toString(), user]));

const formatExpense = (expense, usersById) => ({
  id: expense._id.toString(),
  description: expense.description,
  amount: roundAmount(expense.amount),
  splitType: expense.splitType,
  payer: {
    userId: expense.payer.userId,
    name: usersById.get(expense.payer.userId)?.name || "Unknown user",
  },
  participants: expense.participants.map((participant) => ({
    userId: participant.userId,
    name: usersById.get(participant.userId)?.name || "Unknown user",
    share: roundAmount(participant.share),
  })),
  createdAt: expense.createdAt,
});

const normalizeExpensePayload = (body, users) => {
  const description = String(body.description || "").trim();
  const splitType = String(body.splitType || "equal").trim().toLowerCase();
  const amount = parseAmount(body.amount);
  const payerUserId = String(body.payer?.userId || "").trim();
  const rawParticipants = Array.isArray(body.participants) ? body.participants : [];

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_AMOUNT };
  }

  if (!["equal", "unequal"].includes(splitType)) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_SPLIT_TYPE };
  }

  if (!payerUserId) {
    return { success: false, statusCode: 400, message: EXPENSE.PAYER_REQUIRED };
  }

  const participants = rawParticipants
    .map((participant) => ({
      userId: String(participant?.userId || "").trim(),
      share:
        participant?.share === "" || participant?.share === undefined
          ? ""
          : Number(participant.share),
    }))
    .filter((participant) => participant.userId);

  if (participants.length < 2) {
    return { success: false, statusCode: 400, message: EXPENSE.MIN_PARTICIPANTS };
  }

  const participantIds = participants.map((participant) => participant.userId);

  if (new Set(participantIds).size !== participantIds.length) {
    return { success: false, statusCode: 400, message: EXPENSE.DUPLICATE_PARTICIPANTS };
  }

  const usersMap = buildUserMap(users);

  participants.forEach((participant) => {
    if (!usersMap.has(participant.userId)) {
      return;
    }
  });

  if (participants.some((participant) => !usersMap.has(participant.userId))) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_PARTICIPANTS };
  }

  if (!usersMap.has(payerUserId)) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_PAYER };
  }

  if (!participantIds.includes(payerUserId)) {
    return { success: false, statusCode: 400, message: EXPENSE.PAYER_NOT_IN_PARTICIPANTS };
  }

  let normalizedParticipants;

  if (splitType === "equal") {
    const equalShares = splitEqualAmounts(amount, participants.length);

    normalizedParticipants = participants.map((participant, index) => ({
      userId: participant.userId,
      share: equalShares[index],
    }));
  } else {
    if (participants.some((participant) => !Number.isFinite(participant.share) || participant.share < 0)) {
      return { success: false, statusCode: 400, message: EXPENSE.INVALID_SHARE };
    }

    const totalShares = roundAmount(
      participants.reduce((sum, participant) => sum + Number(participant.share), 0)
    );

    if (totalShares !== amount) {
      return { success: false, statusCode: 400, message: EXPENSE.INVALID_TOTAL_SHARE };
    }

    normalizedParticipants = participants.map((participant) => ({
      userId: participant.userId,
      share: roundAmount(Number(participant.share)),
    }));
  }

  return {
    success: true,
    data: {
      description,
      amount,
      splitType,
      payer: {
        userId: payerUserId,
      },
      participants: normalizedParticipants,
    },
  };
};

const getUsersMapForExpenses = async (expenses) => {
  const userIds = Array.from(
    new Set(
      expenses.flatMap((expense) => [
        expense.payer.userId,
        ...expense.participants.map((participant) => participant.userId),
      ])
    )
  );

  const users = await User.find({ _id: { $in: userIds } });
  return buildUserMap(users);
};

export const createExpenseRecord = async (body) => {
  const payerUserId = String(body.payer?.userId || "").trim();
  const rawParticipants = Array.isArray(body.participants) ? body.participants : [];
  const participantIds = rawParticipants
    .map((participant) => String(participant?.userId || "").trim())
    .filter(Boolean);
  const userIds = Array.from(new Set([...participantIds, payerUserId]));

  const users = await User.find({
    _id: { $in: userIds },
    status: "active",
  });

  const normalizedExpense = normalizeExpensePayload(body, users);

  if (!normalizedExpense.success) {
    return normalizedExpense;
  }

  const expense = await Expense.create(normalizedExpense.data);
  const usersById = buildUserMap(users);

  return { success: true, data: formatExpense(expense.toObject(), usersById) };
};

export const getExpenseList = async () => {
  const expenses = await Expense.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
  const usersById = await getUsersMapForExpenses(expenses);
  return expenses.map((expense) => formatExpense(expense, usersById));
};

export const deleteExpenseRecord = async (expenseId) =>
  Expense.findOneAndUpdate(
    { _id: expenseId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

export const getBalancesSummary = async () => {
  const expenses = await getExpenseList();
  return getBalancesFromExpenses(expenses);
};

export const getSettlementsSummary = async () => {
  const expenses = await getExpenseList();
  return getSettlementsFromExpenses(expenses);
};
