import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    periodStart: "",
    periodEnd: "",
    responsiblePerson: "",
    analyticAccountId: "",
    plannedAmount: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBudgets();
    loadAnalyticAccounts();
  }, []);

  const loadBudgets = async () => {
    try {
      const response = await axios.get(
        `${API}/budgets`
      );

      setBudgets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAnalyticAccounts = async () => {
    try {
      const response = await axios.get(
        `${API}/budgets/analytic-accounts`
      );

      setAnalyticAccounts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createBudget = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.analyticAccountId ||
      !form.plannedAmount
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/budgets`, {
        name: form.name,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        responsiblePerson:
          form.responsiblePerson,
        analyticAccountId: Number(
          form.analyticAccountId
        ),
        plannedAmount: Number(
          form.plannedAmount
        ),
      });

      alert("Budget created successfully");

      setForm({
        name: "",
        periodStart: "",
        periodEnd: "",
        responsiblePerson: "",
        analyticAccountId: "",
        plannedAmount: "",
      });

      loadBudgets();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create budget"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Budgets</h1>
          <p>
            Plan and monitor your income and expenses
          </p>
        </div>
      </div>

      {/* CREATE BUDGET */}

      <div className="form-card">
        <h2>Create Budget</h2>

        <form onSubmit={createBudget}>
          <div className="form-grid">
            <div className="form-group">
              <label>Budget Name *</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: 2026 Furniture Budget"
              />
            </div>

            <div className="form-group">
              <label>Analytic Account *</label>

              <select
                name="analyticAccountId"
                value={
                  form.analyticAccountId
                }
                onChange={handleChange}
              >
                <option value="">
                  Select analytic account
                </option>

                {analyticAccounts.map(
                  (account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name} (
                      {account.type})
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Period Start *</label>

              <input
                type="date"
                name="periodStart"
                value={form.periodStart}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Period End *</label>

              <input
                type="date"
                name="periodEnd"
                value={form.periodEnd}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Responsible Person</label>

              <input
                type="text"
                name="responsiblePerson"
                value={
                  form.responsiblePerson
                }
                onChange={handleChange}
                placeholder="Example: Admin"
              />
            </div>

            <div className="form-group">
              <label>Planned Amount *</label>

              <input
                type="number"
                name="plannedAmount"
                value={form.plannedAmount}
                onChange={handleChange}
                placeholder="500000"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Budget"}
          </button>
        </form>
      </div>

      {/* BUDGET LIST */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Budget List</h2>
            <p>
              {budgets.length} budget
              {budgets.length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Budget</th>
                <th>Analytic Account</th>
                <th>Period</th>
                <th>Responsible</th>
                <th>Planned Amount</th>
              </tr>
            </thead>

            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td>{budget.name}</td>

                  <td>
                    {budget.analyticAccount?.name ||
                      "-"}
                  </td>

                  <td>
                    {new Date(
                      budget.periodStart
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      budget.periodEnd
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {budget.responsiblePerson ||
                      "-"}
                  </td>

                  <td>
                    {formatMoney(
                      budget.plannedAmount
                    )}
                  </td>
                </tr>
              ))}

              {budgets.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No budgets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Budgets;