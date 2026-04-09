const SettlementList = ({ settlements }) => {
  const items = settlements?.settlements || [];
  const totalTransactions = settlements?.totalTransactions || 0;

  return (
    <div className="card">
      <div className="section-title inline-title">
        <div>
          <p>Settlements</p>
          <h2>Optimized Payments</h2>
        </div>
        <span className="pill">{totalTransactions} transactions</span>
      </div>

      {items.length === 0 ? (
        <p className="empty-text">No settlements needed.</p>
      ) : (
        <div className="list-wrap compact">
          {items.map((item, index) => (
            <div className="summary-item" key={`${item.from.userId}-${item.to.userId}-${index}`}>
              <span>{item.summary}</span>
              <strong>Rs {Number(item.amount || 0).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettlementList;
