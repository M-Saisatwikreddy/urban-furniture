import { useEffect, useState } from "react";
import axios from "axios";

function VendorBills() {
  const [bills, setBills] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    purchaseOrderId: "",
    tax: 0,
    dueDate: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      // Load purchase orders independently
      const purchaseResponse = await axios.get(
        "http://localhost:5000/api/purchases"
      );

      setPurchaseOrders(purchaseResponse.data);

      // Load vendor bills independently
      const billResponse = await axios.get(
        "http://localhost:5000/api/vendor-bills"
      );

      setBills(billResponse.data);
    } catch (error) {
      console.error("Failed to load data:", error);

      if (error.response) {
        console.error(
          "Server response:",
          error.response.data
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "purchaseOrderId") {
      const order = purchaseOrders.find(
        (item) => item.id === Number(value)
      );

      setSelectedOrder(order || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purchaseOrderId) {
      alert("Please select a purchase order.");
      return;
    }

    try {
      const billNumber = `BILL-${Date.now()}`;

      await axios.post(
        "http://localhost:5000/api/vendor-bills",
        {
          billNumber,
          purchaseOrderId: Number(
            formData.purchaseOrderId
          ),
          tax: Number(formData.tax) || 0,
          dueDate: formData.dueDate || null,
        }
      );

      alert("Vendor Bill created successfully!");

      setFormData({
        purchaseOrderId: "",
        tax: 0,
        dueDate: "",
      });

      setSelectedOrder(null);
      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(
        "Failed to create vendor bill:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create vendor bill."
      );
    }
  };

  const getSubtotal = () => {
    if (!selectedOrder) {
      return 0;
    }

    return selectedOrder.items.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );
  };

  const getTotal = () => {
    return (
      getSubtotal() +
      (Number(formData.tax) || 0)
    );
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

  // Only show purchase orders that do not already have a bill
  const availablePurchaseOrders = purchaseOrders.filter(
    (order) => {
      const alreadyBilled = bills.some(
        (bill) =>
          Number(bill.purchaseOrderId) ===
          Number(order.id)
      );

      return !alreadyBilled;
    }
  );

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Vendor Bills</h1>

          <p>
            Manage bills received from vendors
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Vendor Bill
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Vendor Bill</h2>

          {availablePurchaseOrders.length === 0 ? (
            <div className="empty-state">
              <div>📋</div>

              <h3>
                No Purchase Orders Available
              </h3>

              <p>
                Create a Purchase Order first, or check
                whether all purchase orders already have
                vendor bills.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Purchase Order</label>

                  <select
                    name="purchaseOrderId"
                    value={formData.purchaseOrderId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select purchase order
                    </option>

                    {availablePurchaseOrders.map(
                      (order) => (
                        <option
                          key={order.id}
                          value={order.id}
                        >
                          {order.orderNumber} -{" "}
                          {order.contact?.name ||
                            "Vendor"}{" "}
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
                  <label>Tax Amount</label>

                  <input
                    type="number"
                    name="tax"
                    min="0"
                    value={formData.tax}
                    onChange={handleChange}
                  />
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
                    Purchase Order Details
                  </h3>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
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

                              <td>
                                {item.quantity}
                              </td>

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
                        {Number(
                          formData.tax
                        ).toLocaleString("en-IN")}
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
                      purchaseOrderId: "",
                      tax: 0,
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
                  Create Vendor Bill
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Vendor Bill List</h3>

            <p>
              {bills.length} vendor bills
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading vendor bills...</p>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <div>🧾</div>

            <h3>No Vendor Bills Yet</h3>

            <p>
              Create a vendor bill from an existing
              purchase order.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Vendor</th>
                  <th>Purchase Order</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <strong>
                        {bill.billNumber}
                      </strong>
                    </td>

                    <td>
                      {bill.contact?.name || "-"}
                    </td>

                    <td>
                      {bill.purchaseOrder
                        ?.orderNumber || "-"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        bill.subtotal
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      ₹
                      {Number(
                        bill.tax
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          bill.total
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          bill.status
                        )}
                      >
                        {bill.status}
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

export default VendorBills;