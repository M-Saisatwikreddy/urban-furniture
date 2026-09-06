import { useEffect, useState } from "react";
import axios from "axios";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    salesOrderId: "",
    dueDate: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadData = async () => {
    setLoading(true);

    try {
      const [invoiceResponse, salesResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/invoices"),
          axios.get(
            "http://localhost:5000/api/sales-orders"
          ),
        ]);

      setInvoices(invoiceResponse.data);
      setSalesOrders(salesResponse.data);
    } catch (error) {
      console.error("Failed to load invoice data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableSalesOrders = salesOrders.filter(
    (order) => {
      const alreadyInvoiced = invoices.some(
        (invoice) =>
          Number(invoice.salesOrderId) ===
          Number(order.id)
      );

      return !alreadyInvoiced;
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "salesOrderId") {
      const order = salesOrders.find(
        (item) => item.id === Number(value)
      );

      setSelectedOrder(order || null);
    }
  };

  const getSubtotal = () => {
    if (!selectedOrder) {
      return 0;
    }

    return selectedOrder.items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) *
          Number(item.unitPrice),
      0
    );
  };

  const getTax = () => {
    if (!selectedOrder) {
      return 0;
    }

    return selectedOrder.items.reduce(
      (sum, item) =>
        sum + Number(item.tax || 0),
      0
    );
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.salesOrderId) {
      alert("Please select a sales order.");
      return;
    }

    try {
      const invoiceNumber = `INV-${Date.now()}`;

      await axios.post(
        "http://localhost:5000/api/invoices",
        {
          invoiceNumber,
          salesOrderId: Number(
            formData.salesOrderId
          ),
          dueDate: formData.dueDate || null,
        }
      );

      alert("Invoice created successfully!");

      setFormData({
        salesOrderId: "",
        dueDate: "",
      });

      setSelectedOrder(null);
      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error("Failed to create invoice:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create invoice."
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "PAID") {
      return "badge badge-success";
    }

    if (status === "CANCELLED") {
      return "badge badge-danger";
    }

    if (status === "PARTIALLY_PAID") {
      return "badge badge-warning";
    }

    return "badge";
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>Manage customer invoices</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Invoice</h2>

          {availableSalesOrders.length === 0 ? (
            <div className="empty-state">
              <div>🧾</div>

              <h3>No Sales Orders Available</h3>

              <p>
                Create a Sales Order first, or check
                whether all sales orders already have
                invoices.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Sales Order</label>

                  <select
                    name="salesOrderId"
                    value={formData.salesOrderId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select sales order
                    </option>

                    {availableSalesOrders.map(
                      (order) => (
                        <option
                          key={order.id}
                          value={order.id}
                        >
                          {order.orderNumber} -{" "}
                          {order.contact?.name ||
                            "Customer"}{" "}
                          - ₹
                          {Number(
                            order.total
                          ).toLocaleString("en-IN")}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label>Due Date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {selectedOrder && (
                <div style={{ marginTop: "24px" }}>
                  <h3
                    style={{
                      marginBottom: "14px",
                      fontSize: "15px",
                    }}
                  >
                    Sales Order Details
                  </h3>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Tax</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedOrder.items.map(
                          (item) => (
                            <tr key={item.id}>
                              <td>
                                {item.product?.name ||
                                  "-"}
                              </td>

                              <td>{item.quantity}</td>

                              <td>
                                ₹
                                {Number(
                                  item.unitPrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  item.tax || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  item.total
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      marginLeft: "auto",
                      maxWidth: "280px",
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span>Subtotal</span>

                      <strong>
                        ₹
                        {getSubtotal().toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span>Tax</span>

                      <strong>
                        ₹
                        {getTax().toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        borderTop:
                          "1px solid #e5e7eb",
                        paddingTop: "10px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        fontSize: "15px",
                      }}
                    >
                      <strong>Total</strong>

                      <strong>
                        ₹
                        {getTotal().toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedOrder(null);

                    setFormData({
                      salesOrderId: "",
                      dueDate: "",
                    });
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Invoice List</h3>

            <p>
              {invoices.length} invoices
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div>🧾</div>

            <h3>No Invoices Yet</h3>

            <p>
              Create an invoice from an existing
              sales order.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Sales Order</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>
                        {invoice.invoiceNumber}
                      </strong>
                    </td>

                    <td>
                      {invoice.contact?.name || "-"}
                    </td>

                    <td>
                      {invoice.salesOrder
                        ?.orderNumber || "-"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        invoice.subtotal
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹
                      {Number(
                        invoice.tax
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          invoice.total
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      ₹
                      {Number(
                        invoice.paidAmount
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          invoice.status
                        )}
                      >
                        {invoice.status}
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

export default Invoices;