import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Reports() {
  const [activeReport, setActiveReport] = useState("profit-loss");
  const [profitLoss, setProfitLoss] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [stock, setStock] = useState(null);
  const [budget, setBudget] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  const loadReport = async (report) => {
    try {
      setLoading(true);

      if (report === "profit-loss") {
        const response = await axios.get(
          `${API}/reports/profit-loss`
        );
        setProfitLoss(response.data);
      }

      if (report === "balance-sheet") {
        const response = await axios.get(
          `${API}/reports/balance-sheet`
        );
        setBalanceSheet(response.data);
      }

      if (report === "stock") {
        const response = await axios.get(
          `${API}/reports/stock`
        );
        setStock(response.data);
      }

      if (report === "budget") {
        const response = await axios.get(
          `${API}/reports/budget`
        );
        setBudget(response.data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>
            View financial, accounting and stock reports
          </p>
        </div>
      </div>

      {/* REPORT TABS */}
      <div className="report-tabs">
        <button
          className={
            activeReport === "profit-loss"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("profit-loss")
          }
        >
          Profit & Loss
        </button>

        <button
          className={
            activeReport === "balance-sheet"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("balance-sheet")
          }
        >
          Balance Sheet
        </button>

        <button
          className={
            activeReport === "stock"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("stock")
          }
        >
          Stock Report
        </button>

        <button
          className={
            activeReport === "budget"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveReport("budget")
          }
        >
          Budget Report
        </button>
      </div>

      {loading && (
        <div className="loading">
          Loading report...
        </div>
      )}

      {/* ============================= */}
      {/* PROFIT & LOSS */}
      {/* ============================= */}

      {!loading &&
        activeReport === "profit-loss" &&
        profitLoss && (
          <div className="report-container">
            <div className="report-cards">
              <div className="report-card">
                <span>Total Income</span>
                <strong>
                  {formatMoney(
                    profitLoss.totalIncome
                  )}
                </strong>
              </div>

              <div className="report-card">
                <span>Total Expenses</span>
                <strong>
                  {formatMoney(
                    profitLoss.totalExpenses
                  )}
                </strong>
              </div>

              <div className="report-card">
                <span>Net Profit</span>
                <strong>
                  {formatMoney(
                    profitLoss.netProfit
                  )}
                </strong>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-section">
                <h2>Income</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {profitLoss.income.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.account}</td>
                          <td>
                            {formatMoney(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="report-section">
                <h2>Expenses</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {profitLoss.expenses.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.account}</td>
                          <td>
                            {formatMoney(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* ============================= */}
      {/* BALANCE SHEET */}
      {/* ============================= */}

      {!loading &&
        activeReport === "balance-sheet" &&
        balanceSheet && (
          <div className="report-container">
            <div className="report-cards">
              <div className="report-card">
                <span>Total Assets</span>
                <strong>
                  {formatMoney(
                    balanceSheet.totalAssets
                  )}
                </strong>
              </div>

              <div className="report-card">
                <span>Total Liabilities</span>
                <strong>
                  {formatMoney(
                    balanceSheet.totalLiabilities
                  )}
                </strong>
              </div>

              <div className="report-card">
                <span>Total Capital</span>
                <strong>
                  {formatMoney(
                    balanceSheet.totalCapital
                  )}
                </strong>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-section">
                <h2>Assets</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {balanceSheet.assets.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.account}</td>
                          <td>
                            {formatMoney(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="report-section">
                <h2>Liabilities & Capital</h2>

                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {balanceSheet.liabilities.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>{item.account}</td>
                          <td>
                            {formatMoney(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}

                    {balanceSheet.capital.map(
                      (item, index) => (
                        <tr key={`capital-${index}`}>
                          <td>{item.account}</td>
                          <td>
                            {formatMoney(
                              item.amount
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* ============================= */}
      {/* STOCK REPORT */}
      {/* ============================= */}

      {!loading &&
        activeReport === "stock" &&
        stock && (
          <div className="report-container">
            <div className="report-cards">
              <div className="report-card">
                <span>Total Stock Value</span>
                <strong>
                  {formatMoney(
                    stock.totalStockValue
                  )}
                </strong>
              </div>
            </div>

            <div className="report-section">
              <h2>Product Stock</h2>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Sales Price</th>
                    <th>Stock Value</th>
                  </tr>
                </thead>

                <tbody>
                  {stock.products.map(
                    (product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                          {product.category || "-"}
                        </td>
                        <td>{product.quantity}</td>
                        <td>
                          {formatMoney(
                            product.purchasePrice
                          )}
                        </td>
                        <td>
                          {formatMoney(
                            product.salesPrice
                          )}
                        </td>
                        <td>
                          {formatMoney(
                            product.stockValue
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ============================= */}
      {/* BUDGET REPORT */}
      {/* ============================= */}

      {!loading &&
        activeReport === "budget" && (
          <div className="report-container">
            <div className="report-section">
              <h2>Budget Report</h2>

              <table>
                <thead>
                  <tr>
                    <th>Budget</th>
                    <th>Analytic Account</th>
                    <th>Type</th>
                    <th>Responsible</th>
                    <th>Planned Amount</th>
                    <th>Actual Amount</th>
                    <th>Variance</th>
                  </tr>
                </thead>

                <tbody>
                  {budget.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {item.analyticAccount}
                      </td>
                      <td>{item.type}</td>
                      <td>
                        {item.responsiblePerson ||
                          "-"}
                      </td>
                      <td>
                        {formatMoney(
                          item.plannedAmount
                        )}
                      </td>
                      <td>
                        {formatMoney(
                          item.actualAmount
                        )}
                      </td>
                      <td>
                        {formatMoney(
                          item.variance
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}

export default Reports;