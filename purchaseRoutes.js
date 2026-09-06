const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all purchase orders
router.get("/", async (req, res) => {
  try {
    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        contact: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch purchase orders",
    });
  }
});

// GET one purchase order
router.get("/:id", async (req, res) => {
  try {
    const purchase = await prisma.purchaseOrder.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        contact: true,
        items: {
          include: {
            product: true,
          },
        },
        bill: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    res.json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch purchase order",
    });
  }
});

// CREATE purchase order
router.post("/", async (req, res) => {
  try {
    const {
      orderNumber,
      contactId,
      items,
    } = req.body;

    if (!orderNumber || !contactId || !items || items.length === 0) {
      return res.status(400).json({
        message: "Order number, vendor and items are required",
      });
    }

    let total = 0;

    const purchaseItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      const itemTotal = quantity * unitPrice;

      total += itemTotal;

      return {
        productId: Number(item.productId),
        quantity,
        unitPrice,
        total: itemTotal,
      };
    });

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        contactId: Number(contactId),
        total,
        status: "DRAFT",

        items: {
          create: purchaseItems,
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

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create purchase order",
    });
  }
});

// UPDATE purchase order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: {
        id: Number(req.params.id),
      },

      data: {
        status,
      },
    });

    res.json(purchaseOrder);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update purchase order status",
    });
  }
});

module.exports = router;