const { COMMON, USER } = require("../utils/msgResponse");
const { sendError, sendSuccess } = require("../utils/responseHelper");
const {
  createUserRecord,
  getUserList,
  updateUserStatusRecord,
} = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const result = await createUserRecord(req.body);

    if (!result.success) {
      return sendError(res, result.statusCode, result.message);
    }

    return sendSuccess(res, 201, USER.CREATED, result.data);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const getUsers = async (_req, res) => {
  try {
    const users = await getUserList();
    return sendSuccess(res, 200, USER.FETCHED, users);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const result = await updateUserStatusRecord(req.params.id, req.body.status);

    if (!result.success) {
      return sendError(res, result.statusCode, result.message);
    }

    return sendSuccess(res, 200, USER.STATUS_UPDATED, result.data);
  } catch (error) {
    return sendError(res, 500, COMMON.SERVER_ERROR, error.message);
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUserStatus,
};
