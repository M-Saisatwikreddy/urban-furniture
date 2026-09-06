import { useEffect, useState } from "react";
import axios from "axios";

function Sales() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    contactId: "",
    productId: "",
    quantity: 1,
    unitPrice: "",
    tax: 0,
  });

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        salesResponse,
        contactsResponse,
        productsResponse,
      ] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/sales-orders"
        ),
        axios.get(
          "http://localhost:5000/api/contacts"
        ),
        axios.get(
          "http://localhost:5000/api/products"
        ),
      ]);

      setSalesOrders(salesResponse.data);

      setCustomers(
        contactsResponse.data.filter(
          (contact) =>
            contact.type === "CUSTOMER" ||
            contact.type === "BOTH"
        )
      );

      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "productId") {
      const product = products.find(
        (item) => item.id === Number(value)
      );

      if (product) {
        setFormData((previous) => ({
          ...previous,
          productId: value,
          unitPrice: product.salesPrice,
        }));
      }
    }
  };

  const getSubtotal = () => {
    return (
      Number(formData.quantity || 0) *
      Number(formData.unitPrice || 0)
    );
  };

  const getTotal = () => {
    return (
      getSubtotal() +
      Number(formData.tax || 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contactId) {
      alert("Please select a customer.");
      return;
    }

    if (!formData.productId) {
      alert("Please select a product.");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    try {
      const orderNumber = `SO-${Date.now()}`;

      await axios.post(
        "http://localhost:5000/api/sales-orders",
        {
          orderNumber,
          contactId: Number(formData.contactId),
          items: [
            {
              productId: Number(formData.productId),
              quantity: Number(formData.quantity),
              unitPrice: Number(formData.unitPrice),
              tax: Number(formData.tax) || 0,
            },
          ],
        }
      );

      alert("Sales Order created successfully!");

      setFormData({
        contactId: "",
        productId: "",
        quantity: 1,
        unitPrice: "",
        tax: 0,
      });

      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(
        "Failed to create sales order:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create sales order."
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "CONFIRMED") {
      return "badge badge-success";
    }

    if (status === "CANCELLED") {
      return "badge badge-danger";
    }

    return "badge";
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Sales</h1>
          <p>Manage customer sales orders</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Create Sales Order
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Sales Order</h2>

          {customers.length === 0 ? (
            <div className="empty-state">
              <div>👤</div>
              <h3>No Customers Available</h3>
              <p>
                Add a Customer in Contacts before creating
                a sales order.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div>🪑</div>
              <h3>No Products Available</h3>
              <p>
                Add a product before creating a sales
                order.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label>Customer</label>

                  <select
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Product</label>

                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} - ₹
                        {Number(
                          product.salesPrice
                        ).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Unit Sales Price</label>

                  <input
                    type="number"
                    name="unitPrice"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Tax Amount</label>

                  <input
                    type="number"
                    name="tax"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
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
                    justifyContent: "space-between",
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
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span>Tax</span>

                  <strong>
                    ₹
                    {Number(
                      formData.tax || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
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

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);

                    setFormData({
                      contactId: "",
                      productId: "",
                      quantity: 1,
                      unitPrice: "",
                      tax: 0,
                    });
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Create Sales Order
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Sales Order List</h3>
            <p>
              {salesOrders.length} sales orders
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading sales orders...</p>
        ) : salesOrders.length === 0 ? (
          <div className="empty-state">
            <div>🛒</div>
            <h3>No Sales Orders Yet</h3>
            <p>
              Create your first sales order for a
              customer.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {salesOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>
                        {order.orderNumber}
                      </strong>
                    </td>

                    <td>
                      {order.contact?.name || "-"}
                    </td>

                    <td>
                      {order.items
                        ?.map(
                          (item) =>
                            `${item.product?.name || "-"} × ${item.quantity}`
                        )
                        .join(", ")}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          order.total
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {order.status}
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

export default Sales;