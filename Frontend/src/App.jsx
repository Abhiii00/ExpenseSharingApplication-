import { useEffect, useState } from "react";
import "./App.css";
import BalanceList from "./component/BalanceList";
import ExpenseForm from "./component/ExpenseForm";
import ExpenseList from "./component/ExpenseList";
import SettlementList from "./component/SettlementList";
import UserManager from "./component/UserManager";
import {
  addExpense,
  addUser,
  getBalances,
  getExpenses,
  getSettlements,
  getUsers,
  removeExpense,
  updateUserStatus,
} from "./coreFIles/helper";

const defaultBalances = {
  summary: [],
  netBalances: [],
};

const defaultSettlements = {
  totalTransactions: 0,
  settlements: [],
};

function App() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(defaultBalances);
  const [settlements, setSettlements] = useState(defaultSettlements);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);

    try {
      const [userData, expenseData, balanceData, settlementData] = await Promise.all([
        getUsers(),
        getExpenses(),
        getBalances(),
        getSettlements(),
      ]);

      setUsers(userData);
      setExpenses(expenseData);
      setBalances(balanceData);
      setSettlements(settlementData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load application data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = async (form) => {
    try {
      await addUser(form);
      await loadData();
      setError("");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user.");
      return false;
    }
  };

  const handleToggleUserStatus = async (userId, status) => {
    try {
      await updateUserStatus(userId, status);
      await loadData();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    }
  };

  const handleCreateExpense = async (payload) => {
    try {
      setSaving(true);
      await addExpense(payload);
      await loadData();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      setDeletingId(expenseId);
      await removeExpense(expenseId);
      await loadData();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete expense.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <h1>Expense Sharing</h1>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="layout">
        <div className="left-panel">
          <UserManager users={users} onAddUser={handleAddUser} onToggleUserStatus={handleToggleUserStatus} />
        </div>

        <div className="right-panel">
          {loading ? (
            <div className="card">
              <p className="empty-text">Loading data...</p>
            </div>
          ) : (
            <>
              <ExpenseForm onCreate={handleCreateExpense} loading={saving} users={users} />
              <BalanceList balances={balances} />
              <SettlementList settlements={settlements} />
              <ExpenseList
                expenses={expenses}
                deletingId={deletingId}
                onDelete={handleDeleteExpense}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
