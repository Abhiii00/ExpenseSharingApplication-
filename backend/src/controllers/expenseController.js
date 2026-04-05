const {
  createExpenseRecord,
  deleteExpenseRecord,
  getBalancesSummary,
  getExpenseList,
  getSettlementsSummary,
} = require("../services/expenseService");
const { COMMON, EXPENSE } = require("../utils/msgResponse");
const { sendError, sendSuccess } = require("../utils/responseHelper");

const createExpense = async (req, res) => {
  try {
    const result = await createExpenseRecord(req.body);

    if (!result.success) {
      return sendError(res, result.statusCode, result.message);
    }

    return sendSuccess(res, 201, EXPENSE.CREATED, result.data);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await getExpenseList();

    return sendSuccess(res, 200, EXPENSE.FETCHED, expenses);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await deleteExpenseRecord(req.params.id);

    if (!expense) {
      return sendError(res, 404, EXPENSE.NOT_FOUND);
    }

    return sendSuccess(res, 200, EXPENSE.DELETED);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const getBalances = async (req, res) => {
  try {
    const balances = await getBalancesSummary();
    return sendSuccess(res, 200, EXPENSE.BALANCES_FETCHED, balances);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const getSettlements = async (req, res) => {
  try {
    const settlements = await getSettlementsSummary();
    return sendSuccess(res, 200, EXPENSE.SETTLEMENTS_FETCHED, settlements);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  deleteExpense,
  getBalances,
  getSettlements,
};
