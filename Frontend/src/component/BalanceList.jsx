const BalanceList = ({ balances }) => {
  return (
    <div className="card">
      <div className="section-title">
        <p>Balances</p>
        <h2>Who Owes Whom</h2>
      </div>

      {balances.summary.length === 0 ? (
        <p className="empty-text">Everything is settled.</p>
      ) : (
        <>
          <div className="list-wrap compact">
            {balances.summary.map((item) => (
              <div className="summary-item" key={`${item.from.userId}-${item.to.userId}`}>
                <span>{item.summary}</span>
                <strong>Rs {item.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="net-grid">
            {balances.netBalances.map((user) => (
              <div className="net-card" key={user.userId}>
                <h3>{user.name}</h3>
                <strong>Rs {Math.abs(user.balance).toFixed(2)}</strong>
                <p>{user.status === "get_back" ? "Should receive" : "Needs to pay"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BalanceList;
