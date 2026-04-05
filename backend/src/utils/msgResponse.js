const COMMON = {
  SERVER_ERROR: "Something went wrong on the server",
  NOT_FOUND: "Requested resource not found",
};

const USER = {
  NAME_REQUIRED: "User name is required",
  USERNAME_REQUIRED: "Username is required",
  USERNAME_EXISTS: "Username already exists",
  CREATED: "User created successfully",
  FETCHED: "Users fetched successfully",
  STATUS_INVALID: "User status must be active or inactive",
  STATUS_UPDATED: "User status updated successfully",
  NOT_FOUND: "User not found",
};

const EXPENSE = {
  CREATED: "Expense created successfully",
  FETCHED: "Expenses fetched successfully",
  DELETED: "Expense deleted successfully",
  NOT_FOUND: "Expense not found",
  BALANCES_FETCHED: "Balances fetched successfully",
  SETTLEMENTS_FETCHED: "Settlements fetched successfully",
  INVALID_AMOUNT: "Amount must be greater than zero.",
  INVALID_SPLIT_TYPE: "Split type must be equal or unequal.",
  PAYER_REQUIRED: "Payer is required.",
  MIN_PARTICIPANTS: "At least two participants are required.",
  DUPLICATE_PARTICIPANTS: "Participants must be unique.",
  INVALID_PARTICIPANTS: "Selected participants must be active users.",
  INVALID_PAYER: "Payer must be an active user.",
  PAYER_NOT_IN_PARTICIPANTS: "Payer must be included in participants.",
  INVALID_SHARE: "Each participant share must be a valid amount.",
  INVALID_TOTAL_SHARE: "Participant shares must add up to the total amount.",
};

module.exports = {
  COMMON,
  USER,
  EXPENSE,
};
