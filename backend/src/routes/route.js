import express from "express";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getBalances,
  getSettlements,
} from "../controllers/expenseController.js";
import { createUser, getUsers, updateUserStatus } from "../controllers/userController.js";

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

export default router;
