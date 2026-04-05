import { api } from "./config";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data.data;
};

export const addUser = async (payload) => {
  const response = await api.post("/users", payload);
  return response.data.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/users/${userId}/status`, { status });
  return response.data.data;
};

export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data.data;
};

export const addExpense = async (payload) => {
  const response = await api.post("/expenses", payload);
  return response.data.data;
};

export const removeExpense = async (expenseId) => {
  await api.delete(`/expenses/${expenseId}`);
};

export const getBalances = async () => {
  const response = await api.get("/balances");
  return response.data.data;
};

export const getSettlements = async () => {
  const response = await api.get("/settlements");
  return response.data.data;
};
