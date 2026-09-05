const express = require("express");
const cors = require("cors");
require("dotenv").config();

const contactRoutes = require("./routes/contactRoutes");
const productRoutes = require("./routes/productRoutes");
const accountRoutes = require("./routes/accountRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Urban Furniture Accounting API is running!",
  });
});

app.use("/api/contacts", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/accounts", accountRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});