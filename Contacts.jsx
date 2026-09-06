import { useEffect, useState } from "react";
import axios from "axios";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "CUSTOMER",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch contacts when page opens
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/contacts"
        );

        setContacts(response.data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create contact
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/contacts",
        formData
      );

      alert("Contact created successfully!");

      setFormData({
        name: "",
        type: "CUSTOMER",
        email: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setShowForm(false);

      // Refresh contacts after creating
      const response = await axios.get(
        "http://localhost:5000/api/contacts"
      );

      setContacts(response.data);
    } catch (error) {
      console.error("Failed to create contact:", error);

      alert("Failed to create contact");
    }
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Contacts</h1>
          <p>Manage your customers and vendors</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Contact
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add Contact</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label>Type</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              <div>
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>

              <div>
                <label>Mobile</label>

                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Mobile number"
                />
              </div>

              <div>
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>

              <div>
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div>
                <label>State</label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div>
                <label>Pincode</label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                />
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
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Contact List</h3>
            <p>{contacts.length} contacts</p>
          </div>
        </div>

        {loading ? (
          <p>Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>State</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <strong>{contact.name}</strong>
                    </td>

                    <td>
                      <span className="badge">
                        {contact.type}
                      </span>
                    </td>

                    <td>{contact.email || "-"}</td>

                    <td>{contact.mobile || "-"}</td>

                    <td>{contact.city || "-"}</td>

                    <td>{contact.state || "-"}</td>
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

export default Contacts;