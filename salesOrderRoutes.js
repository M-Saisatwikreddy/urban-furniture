const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all sales orders
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        contact: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("GET SALES ORDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch sales orders",
      error: error.message,
    });
  }
});

// GET one sales order
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid sales order ID",
      });
    }

    const order = await prisma.salesOrder.findUnique({
      where: {
        id,
      },
      include: {
        contact: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Sales order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error("GET SALES ORDER ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch sales order",
      error: error.message,
    });
  }
});

// CREATE sales order
router.post("/", async (req, res) => {
  try {
    const {
      orderNumber,
      contactId,
      items,
    } = req.body;

    if (
      !orderNumber ||
      !contactId ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order number, customer and items are required",
      });
    }

    const customer = await prisma.contact.findUnique({
      where: {
        id: Number(contactId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    let total = 0;

    const salesItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const tax = Number(item.tax) || 0;

      const subtotal = quantity * unitPrice;
      const itemTotal = subtotal + tax;

      total += itemTotal;

      return {
        productId: Number(item.productId),
        quantity,
        unitPrice,
        tax,
        total: itemTotal,
      };
    });

    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNumber,
        contactId: Number(contactId),
        status: "DRAFT",
        total,

        items: {
          create: salesItems,
        },
      },

      include: {
        contact: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json(salesOrder);
  } catch (error) {
    console.error("CREATE SALES ORDER ERROR:", error);

    res.status(500).json({
      message: "Failed to create sales order",
      error: error.message,
    });
  }
});

// UPDATE sales order status
router.put("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid sales order ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const order = await prisma.salesOrder.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    res.json(order);
  } catch (error) {
    console.error("UPDATE SALES ORDER ERROR:", error);

    res.status(500).json({
      message: "Failed to update sales order status",
      error: error.message,
    });
  }
});

module.exports = router;