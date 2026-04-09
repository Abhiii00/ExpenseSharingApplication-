const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const { parseAmount, roundAmount, splitEqualAmounts } = require("../utils/money");
const { EXPENSE } = require("../utils/msgResponse");
const { getBalancesFromExpenses, getSettlementsFromExpenses } = require("../utils/settlementHelpers");

const getUserMap = (users) =>
  new Map(users.map((user) => [user._id.toString(), user]));

const getParticipants = (list) =>
  list
    .map((item) => ({
      userId: String(item?.userId || "").trim(),
      share: item?.share === "" || item?.share === undefined ? "" : Number(item.share),
    }))
    .filter((item) => item.userId);

const getActiveUsers = async (userIds) =>
  User.find({
    _id: { $in: userIds },
    status: "active",
  });

const normalizeExpensePayload = (body, users) => {
  const description = String(body.description || "").trim();
  const splitType = String(body.splitType || "equal").trim().toLowerCase();
  const amount = parseAmount(body.amount);
  const payerUserId = String(body.payer?.userId || "").trim();
  const participantList = Array.isArray(body.participants) ? body.participants : [];

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_AMOUNT };
  }

  if (!["equal", "unequal"].includes(splitType)) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_SPLIT_TYPE };
  }

  if (!payerUserId) {
    return { success: false, statusCode: 400, message: EXPENSE.PAYER_REQUIRED };
  }

  const participants = getParticipants(participantList);

  if (participants.length < 2) {
    return { success: false, statusCode: 400, message: EXPENSE.MIN_PARTICIPANTS };
  }

  const participantIds = participants.map((item) => item.userId);
  const uniqueParticipantIds = new Set(participantIds);
  const userMap = getUserMap(users);

  if (uniqueParticipantIds.size !== participantIds.length) {
    return { success: false, statusCode: 400, message: EXPENSE.DUPLICATE_PARTICIPANTS };
  }

  const hasInvalidParticipant = participants.some((item) => !userMap.has(item.userId));

  if (hasInvalidParticipant) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_PARTICIPANTS };
  }

  if (!userMap.has(payerUserId)) {
    return { success: false, statusCode: 400, message: EXPENSE.INVALID_PAYER };
  }

  if (!participantIds.includes(payerUserId)) {
    return { success: false, statusCode: 400, message: EXPENSE.PAYER_NOT_IN_PARTICIPANTS };
  }

  let normalizedParticipants;

  if (splitType === "equal") {
    const equalShares = splitEqualAmounts(amount, participants.length);
    normalizedParticipants = participants.map((item, index) => ({
      userId: item.userId,
      share: equalShares[index],
    }));
  } else {
    let totalShare = 0;

    normalizedParticipants = [];

    for (let index = 0; index < participants.length; index += 1) {
      const participant = participants[index];

      if (!Number.isFinite(participant.share) || participant.share < 0) {
        return { success: false, statusCode: 400, message: EXPENSE.INVALID_SHARE };
      }

      const roundedShare = roundAmount(Number(participant.share));
      totalShare += roundedShare;
      normalizedParticipants.push({
        userId: participants[index].userId,
        share: roundedShare,
      });
    }

    totalShare = roundAmount(totalShare);

    if (totalShare !== amount) {
      return { success: false, statusCode: 400, message: EXPENSE.INVALID_TOTAL_SHARE };
    }
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

const createExpenseRecord = async (body) => {
  const payerUserId = String(body.payer?.userId || "").trim();
  const participantList = Array.isArray(body.participants) ? body.participants : [];
  const participants = getParticipants(participantList);
  const userIds = Array.from(
    new Set([payerUserId, ...participants.map((item) => item.userId)])
  );

  const users = await getActiveUsers(userIds);

  const normalizedExpense = normalizeExpensePayload(body, users);

  if (!normalizedExpense.success) {
    return normalizedExpense;
  }

  await Expense.create(normalizedExpense.data);

  return {
    success: true,
    data: null,
  };
};

const getExpenseList = async () =>
  Expense.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $addFields: {
        payerObjectId: {
          $convert: {
            input: "$payer.userId",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "payerObjectId",
        foreignField: "_id",
        as: "payerUser",
      },
    },
    {
      $unwind: "$participants",
    },
    {
      $addFields: {
        participantObjectId: {
          $convert: {
            input: "$participants.userId",
            to: "objectId",
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "participantObjectId",
        foreignField: "_id",
        as: "participantUser",
      },
    },
    {
      $group: {
        _id: "$_id",
        description: { $first: "$description" },
        amount: { $first: "$amount" },
        splitType: { $first: "$splitType" },
        createdAt: { $first: "$createdAt" },
        payerUserId: { $first: "$payer.userId" },
        payerName: {
          $first: {
            $ifNull: [{ $arrayElemAt: ["$payerUser.name", 0] }, "Unknown user"],
          },
        },
        participants: {
          $push: {
            userId: "$participants.userId",
            name: {
              $ifNull: [{ $arrayElemAt: ["$participantUser.name", 0] }, "Unknown user"],
            },
            share: "$participants.share",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        description: 1,
        amount: 1,
        splitType: 1,
        createdAt: 1,
        payer: {
          userId: "$payerUserId",
          name: "$payerName",
        },
        participants: 1,
      },
    },
  ]);

const deleteExpenseRecord = async (expenseId) =>
  Expense.findOneAndUpdate(
    { _id: expenseId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

const getBalancesSummary = async () => {
  const expenses = await getExpenseList();
  return getBalancesFromExpenses(expenses);
};

const getSettlementsSummary = async () => {
  const expenses = await getExpenseList();
  return getSettlementsFromExpenses(expenses);
};

module.exports = {
  createExpenseRecord,
  getExpenseList,
  deleteExpenseRecord,
  getBalancesSummary,
  getSettlementsSummary,
};
