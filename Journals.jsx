import { useEffect, useState } from "react";
import axios from "axios";

function Journals() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "SALES",
    defaultAccountId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [journalResponse, accountResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/journals"),
          axios.get("http://localhost:5000/api/accounts"),
        ]);

        setJournals(journalResponse.data);
        setAccounts(accountResponse.data);
      } catch (error) {
        console.error("Failed to load journals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      await axios.post("http://localhost:5000/api/journals", {
        name: formData.name,
        type: formData.type,
        defaultAccountId: formData.defaultAccountId,
      });

      alert("Journal created successfully!");

      setFormData({
        name: "",
        type: "SALES",
        defaultAccountId: "",
      });

      setShowForm(false);

      const response = await axios.get(
        "http://localhost:5000/api/journals"
      );

      setJournals(response.data);
    } catch (error) {
      console.error("Failed to create journal:", error);

      alert("Failed to create journal");
    }
  };

  const getAccountName = (accountId) => {
    if (!accountId) {
      return "-";
    }

    const account = accounts.find(
      (item) => item.id === accountId
    );

    return account ? account.name : "-";
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Journals</h1>
          <p>
            Manage accounting journals and their default accounts
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Journal
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add Journal</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Journal Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sales Journal"
                  required
                />
              </div>

              <div>
                <label>Journal Type</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label>Default Account</label>

                <select
                  name="defaultAccountId"
                  value={formData.defaultAccountId}
                  onChange={handleChange}
                >
                  <option value="">
                    Select default account
                  </option>

                  {accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.code
                        ? `${account.code} - ${account.name}`
                        : account.name}
                    </option>
                  ))}
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
                Save Journal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Journal List</h3>
            <p>{journals.length} journals</p>
          </div>
        </div>

        {loading ? (
          <p>Loading journals...</p>
        ) : journals.length === 0 ? (
          <p>No journals found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Journal Name</th>
                  <th>Type</th>
                  <th>Default Account</th>
                </tr>
              </thead>

              <tbody>
                {journals.map((journal) => (
                  <tr key={journal.id}>
                    <td>
                      <strong>{journal.name}</strong>
                    </td>

                    <td>
                      <span className="badge">
                        {journal.type}
                      </span>
                    </td>

                    <td>
                      {getAccountName(
                        journal.defaultAccountId
                      )}
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

export default Journals;