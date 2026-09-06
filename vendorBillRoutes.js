const express = require("express");
const prisma = require("../db");

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({
    message: "Vendor Bill API is working",
  });
});

// GET ALL VENDOR BILLS
router.get("/", async (req, res) => {
  try {
    const bills = await prisma.vendorBill.findMany({
      include: {
        contact: true,
        purchaseOrder: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bills);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch vendor bills",
    });
  }
});

// GET ONE VENDOR BILL
router.get("/:id", async (req, res) => {
  try {
    const bill = await prisma.vendorBill.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        contact: true,
        purchaseOrder: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!bill) {
      return res.status(404).json({
        message: "Vendor bill not found",
      });
    }

    res.json(bill);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch vendor bill",
    });
  }
});

// CREATE VENDOR BILL
router.post("/", async (req, res) => {
  try {
    const {
      billNumber,
      purchaseOrderId,
      tax,
      dueDate,
    } = req.body;

    if (!billNumber || !purchaseOrderId) {
      return res.status(400).json({
        message:
          "Bill number and purchase order are required",
      });
    }

    // FIND PURCHASE ORDER
    const purchaseOrder =
      await prisma.purchaseOrder.findUnique({
        where: {
          id: Number(purchaseOrderId),
        },
        include: {
          contact: true,
          items: true,
        },
      });

    if (!purchaseOrder) {
      return res.status(404).json({
        message: "Purchase order not found",
      });
    }

    // PREVENT DUPLICATE BILL FOR SAME PO
    const existingBill =
      await prisma.vendorBill.findUnique({
        where: {
          purchaseOrderId: Number(purchaseOrderId),
        },
      });

    if (existingBill) {
      return res.status(400).json({
        message:
          "A vendor bill already exists for this purchase order",
      });
    }

    // CALCULATE SUBTOTAL
    let subtotal = 0;

    const billItems =
      purchaseOrder.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        const itemTotal =
          quantity * unitPrice;

        subtotal += itemTotal;

        return {
          productId: item.productId,
          quantity,
          unitPrice,
          tax: 0,
          total: itemTotal,
        };
      });

    const totalTax = Number(tax) || 0;
    const total = subtotal + totalTax;

    // CREATE VENDOR BILL
    const bill =
      await prisma.vendorBill.create({
        data: {
          billNumber,
          contactId: purchaseOrder.contactId,
          purchaseOrderId:
            Number(purchaseOrderId),
          invoiceDate: new Date(),
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
          status: "UNPAID",
          subtotal,
          tax: totalTax,
          total,

          items: {
            create: billItems,
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

    // ------------------------------------------------
    // FIND ACCOUNTS
    // ------------------------------------------------

    const purchases =
      await prisma.account.findFirst({
        where: {
          name: "Purchases Expense",
        },
      });

    const creditors =
      await prisma.account.findFirst({
        where: {
          name: "Creditors",
        },
      });

    if (!purchases || !creditors) {
      return res.status(500).json({
        message:
          "Purchases Expense or Creditors account not found",
      });
    }

    // FIND OR CREATE INPUT TAX ACCOUNT
    let inputTax =
      await prisma.account.findFirst({
        where: {
          name: "Input Tax",
        },
      });

    if (!inputTax) {
      inputTax =
        await prisma.account.create({
          data: {
            name: "Input Tax",
            type: "ASSET",
            code: "1200",
          },
        });
    }

    // ------------------------------------------------
    // FIND PURCHASE JOURNAL
    // ------------------------------------------------

    const purchaseJournal =
      await prisma.journal.findFirst({
        where: {
          name: "Purchase Journal",
        },
      });

    if (!purchaseJournal) {
      return res.status(500).json({
        message:
          "Purchase Journal not found",
      });
    }

    // ------------------------------------------------
    // CREATE DOUBLE-ENTRY ACCOUNTING
    // ------------------------------------------------

    const journalItems = [
      {
        accountId: purchases.id,
        debit: subtotal,
        credit: 0,
      },
    ];

    // Add Input Tax when tax exists
    if (totalTax > 0) {
      journalItems.push({
        accountId: inputTax.id,
        debit: totalTax,
        credit: 0,
      });
    }

    // Credit vendor / creditors
    journalItems.push({
      accountId: creditors.id,
      debit: 0,
      credit: total,
    });

    await prisma.journalEntry.create({
      data: {
        journalId: purchaseJournal.id,
        date: new Date(),
        reference: billNumber,
        description:
          `Vendor Bill ${billNumber}`,

        items: {
          create: journalItems,
        },
      },
    });

    // UPDATE PURCHASE ORDER
    await prisma.purchaseOrder.update({
      where: {
        id: Number(purchaseOrderId),
      },
      data: {
        status: "CONFIRMED",
      },
    });

    res.status(201).json({
      message:
        "Vendor bill created and accounting entry posted successfully",
      bill,
      accounting: {
        totalDebit: total,
        totalCredit: total,
      },
    });
  } catch (error) {
    console.error(
      "CREATE VENDOR BILL ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create vendor bill",
      error: error.message,
    });
  }
});

// UPDATE VENDOR BILL STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const bill =
      await prisma.vendorBill.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          status,
        },
      });

    res.json(bill);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update vendor bill status",
    });
  }
});

module.exports = router;