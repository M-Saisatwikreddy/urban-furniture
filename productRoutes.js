const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// GET one product
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// CREATE product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      salesPrice,
      purchasePrice,
      category,
      stock,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Product name and type are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        salesPrice: Number(salesPrice) || 0,
        purchasePrice: Number(purchasePrice) || 0,
        category: category || null,
        stock: Number(stock) || 0,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        type: req.body.type,
        salesPrice:
          req.body.salesPrice !== undefined
            ? Number(req.body.salesPrice)
            : undefined,
        purchasePrice:
          req.body.purchasePrice !== undefined
            ? Number(req.body.purchasePrice)
            : undefined,
        category: req.body.category,
        stock:
          req.body.stock !== undefined
            ? Number(req.body.stock)
            : undefined,
      },
    });

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
});

// ARCHIVE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        isArchived: true,
      },
    });

    res.json({
      message: "Product archived successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to archive product",
    });
  }
});

module.exports = router;