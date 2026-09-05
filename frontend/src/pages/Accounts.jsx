import { useEffect, useState } from "react";
import axios from "axios";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "ASSET",
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/accounts"
        );

        setAccounts(response.data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/accounts",
        formData
      );

      alert("Account created successfully!");

      setFormData({
        name: "",
        code: "",
        type: "ASSET",
      });

      setShowForm(false);

      const response = await axios.get(
        "http://localhost:5000/api/accounts"
      );

      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to create account:", error);

      alert("Failed to create account");
    }
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Chart of Accounts</h1>
          <p>
            Manage accounts used for your accounting transactions
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Account
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Account Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Furniture Sales"
                  required
                />
              </div>

              <div>
                <label>Account Code</label>

                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. 4002"
                />
              </div>

              <div>
                <label>Account Type</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                  <option value="CAPITAL">Capital</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Account List</h3>
            <p>{accounts.length} accounts</p>
          </div>
        </div>

        {loading ? (
          <p>Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <strong>{account.code || "-"}</strong>
                    </td>

                    <td>{account.name}</td>

                    <td>
                      <span className="badge">
                        {account.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accounts;