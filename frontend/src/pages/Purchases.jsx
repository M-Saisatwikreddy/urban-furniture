import { useEffect, useState } from "react";
import axios from "axios";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    contactId: "",
    productId: "",
    quantity: 1,
    unitPrice: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [purchaseResponse, contactResponse, productResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/purchases"),
          axios.get("http://localhost:5000/api/contacts"),
          axios.get("http://localhost:5000/api/products"),
        ]);

      setPurchases(purchaseResponse.data);

      setVendors(
        contactResponse.data.filter(
          (contact) =>
            contact.type === "VENDOR" || contact.type === "BOTH"
        )
      );

      setProducts(productResponse.data);
    } catch (error) {
      console.error("Failed to load purchase data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "productId") {
      const selectedProduct = products.find(
        (product) => product.id === Number(value)
      );

      if (selectedProduct) {
        setFormData((previous) => ({
          ...previous,
          productId: value,
          unitPrice: selectedProduct.purchasePrice,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contactId || !formData.productId) {
      alert("Please select vendor and product.");
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === Number(formData.productId)
    );

    if (!selectedProduct) {
      alert("Product not found.");
      return;
    }

    try {
      const orderNumber = `PO-${Date.now()}`;

      await axios.post("http://localhost:5000/api/purchases", {
        orderNumber,
        contactId: Number(formData.contactId),

        items: [
          {
            productId: Number(formData.productId),
            quantity: Number(formData.quantity),
            unitPrice: Number(formData.unitPrice),
          },
        ],
      });

      alert("Purchase Order created successfully!");

      setFormData({
        contactId: "",
        productId: "",
        quantity: 1,
        unitPrice: "",
      });

      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error("Failed to create purchase order:", error);

      alert("Failed to create purchase order.");
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
          <h1>Purchases</h1>
          <p>
            Create and manage purchase orders from vendors
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + New Purchase Order
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Create Purchase Order</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Vendor</label>

                <select
                  name="contactId"
                  value={formData.contactId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select vendor
                  </option>

                  {vendors.map((vendor) => (
                    <option
                      key={vendor.id}
                      value={vendor.id}
                    >
                      {vendor.name}
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
                      {product.name}
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
                <label>Unit Purchase Price</label>

                <input
                  type="number"
                  name="unitPrice"
                  min="0"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.quantity && formData.unitPrice && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <strong>
                  Estimated Total: ₹
                  {(
                    Number(formData.quantity) *
                    Number(formData.unitPrice)
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            )}

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
                Create Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Purchase Orders</h3>
            <p>{purchases.length} purchase orders</p>
          </div>
        </div>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <div>🛒</div>
            <h3>No Purchase Orders Yet</h3>
            <p>
              Create your first purchase order using the
              button above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Vendor</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <strong>
                        {purchase.orderNumber}
                      </strong>
                    </td>

                    <td>
                      {purchase.contact?.name || "-"}
                    </td>

                    <td>
                      {purchase.items
                        ?.map((item) => item.product?.name)
                        .join(", ") || "-"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        purchase.total
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          purchase.status
                        )}
                      >
                        {purchase.status}
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

export default Purchases;