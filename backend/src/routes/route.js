const express = require("express");
const {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getBalances,
  getSettlements,
} = require("../controllers/expenseController");
const { createUser, getUsers, updateUserStatus } = require("../controllers/userController");

const router = express.Router();

router.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Server is running",
  });
});

router.post("/users", createUser);
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.post("/expenses", createExpense);
router.get("/expenses", getAllExpenses);
router.delete("/expenses/:id", deleteExpense);
router.get("/balances", getBalances);
router.get("/settlements", getSettlements);

module.exports = router;
