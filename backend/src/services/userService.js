const User = require("../models/userModel");
const { USER } = require("../utils/msgResponse");

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  username: user.username,
  status: user.status,
});

const createUserRecord = async (body) => {
  const name = String(body.name || "").trim();
  const username = String(body.username || "").trim().toLowerCase();

  if (!name) {
    return { success: false, statusCode: 400, message: USER.NAME_REQUIRED };
  }

  if (!username) {
    return { success: false, statusCode: 400, message: USER.USERNAME_REQUIRED };
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return { success: false, statusCode: 400, message: USER.USERNAME_EXISTS };
  }

  const user = await User.create({ name, username });
  return { success: true, data: formatUser(user) };
};

const getUserList = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(formatUser);
};

const updateUserStatusRecord = async (userId, status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (!["active", "inactive"].includes(normalizedStatus)) {
    return { success: false, statusCode: 400, message: USER.STATUS_INVALID };
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { status: normalizedStatus },
    { new: true }
  );

  if (!user) {
    return { success: false, statusCode: 404, message: USER.NOT_FOUND };
  }

  return { success: true, data: formatUser(user) };
};

module.exports = {
  createUserRecord,
  getUserList,
  updateUserStatusRecord,
};
