const ExpenseList = ({ expenses, deletingId, onDelete }) => {
  return (
    <div className="card">
      <div className="section-title">
        <p>Expenses</p>
        <h2>All Expenses</h2>
      </div>

      {expenses.length === 0 ? (
        <p className="empty-text">No expenses added yet.</p>
      ) : (
        <div className="list-wrap">
          {expenses.map((expense) => (
            <div className="list-item" key={expense.id}>
              <div className="expense-header">
                <div>
                  <h3>{expense.description || "Untitled expense"}</h3>
                  <p>Paid by {expense.payer?.name || "Unknown payer"} | {expense.splitType} split</p>
                </div>
                <strong>Rs {Number(expense.amount || 0).toFixed(2)}</strong>
              </div>

              <div className="tag-wrap">
                {(expense.participants || []).map((participant) => (
                  <span className="tag" key={participant.userId}>
                    {participant.name}: Rs {Number(participant.share || 0).toFixed(2)}
                  </span>
                ))}
              </div>

              <button
                className="danger-btn small"
                onClick={() => onDelete(expense.id)}
                disabled={deletingId === expense.id}
              >
                {deletingId === expense.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
