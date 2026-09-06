const express = require("express");
const cors = require("cors");
require("dotenv").config();

const contactRoutes = require("./routes/contactRoutes");
const productRoutes = require("./routes/productRoutes");
const accountRoutes = require("./routes/accountRoutes");
const journalRoutes = require("./routes/journalRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const vendorBillRoutes = require("./routes/vendorBillRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Urban Furniture Accounting API is running!",
  });
});

// APIs
app.use("/api/contacts", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/vendor-bills", vendorBillRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/reports", reportRoutes);
app.get("/api/budget-test", (req, res) => {
  res.json({ message: "Budget route is connected!" });
});
app.use("/api/budgets", budgetRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});