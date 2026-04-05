const SettlementList = ({ settlements }) => {
  return (
    <div className="card">
      <div className="section-title inline-title">
        <div>
          <p>Settlements</p>
          <h2>Optimized Payments</h2>
        </div>
        <span className="pill">{settlements.totalTransactions} transactions</span>
      </div>

      {settlements.settlements.length === 0 ? (
        <p className="empty-text">No settlements needed.</p>
      ) : (
        <div className="list-wrap compact">
          {settlements.settlements.map((item, index) => (
            <div className="summary-item" key={`${item.from.userId}-${item.to.userId}-${index}`}>
              <span>{item.summary}</span>
              <strong>Rs {item.amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettlementList;
