import { useEffect, useState } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "GOODS",
    salesPrice: "",
    purchasePrice: "",
    category: "",
    stock: "0",
  });

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products"
        );

        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/products",
        {
          name: formData.name,
          type: formData.type,
          salesPrice: Number(formData.salesPrice),
          purchasePrice: Number(formData.purchasePrice),
          category: formData.category,
          stock: Number(formData.stock),
        }
      );

      alert("Product created successfully!");

      setFormData({
        name: "",
        type: "GOODS",
        salesPrice: "",
        purchasePrice: "",
        category: "",
        stock: "0",
      });

      setShowForm(false);

      // Reload products
      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Failed to create product:", error);

      alert("Failed to create product");
    }
  };

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage furniture products and inventory</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add Product</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label>Product Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Office Chair"
                  required
                />
              </div>

              <div>
                <label>Product Type</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="GOODS">Goods</option>
                  <option value="SERVICE">Service</option>
                  <option value="COMBO">Combo</option>
                </select>
              </div>

              <div>
                <label>Sales Price</label>

                <input
                  type="number"
                  name="salesPrice"
                  value={formData.salesPrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label>Purchase Price</label>

                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Chairs"
                />
              </div>

              <div>
                <label>Opening Stock</label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
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
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="panel-header">
          <div>
            <h3>Product List</h3>
            <p>{products.length} products</p>
          </div>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Sales Price</th>
                  <th>Purchase Price</th>
                  <th>Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>
                      <span className="badge">
                        {product.type}
                      </span>
                    </td>

                    <td>
                      {product.category || "-"}
                    </td>

                    <td>
                      ₹{Number(product.salesPrice).toLocaleString()}
                    </td>

                    <td>
                      ₹{Number(product.purchasePrice).toLocaleString()}
                    </td>

                    <td>{product.stock}</td>
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

export default Products;