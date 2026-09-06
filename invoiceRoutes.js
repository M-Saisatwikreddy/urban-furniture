const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        contact: true,
        salesOrder: true,
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

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch invoices",
    });
  }
});

// GET one invoice
router.get("/:id", async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        contact: true,
        salesOrder: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch invoice",
    });
  }
});

// CREATE invoice from sales order
router.post("/", async (req, res) => {
  try {
    const {
      invoiceNumber,
      salesOrderId,
      dueDate,
    } = req.body;

    if (!invoiceNumber || !salesOrderId) {
      return res.status(400).json({
        message:
          "Invoice number and sales order are required",
      });
    }

    const salesOrder =
      await prisma.salesOrder.findUnique({
        where: {
          id: Number(salesOrderId),
        },
        include: {
          contact: true,
          items: true,
        },
      });

    if (!salesOrder) {
      return res.status(404).json({
        message: "Sales order not found",
      });
    }

    const existingInvoice =
      await prisma.invoice.findUnique({
        where: {
          salesOrderId: Number(salesOrderId),
        },
      });

    if (existingInvoice) {
      return res.status(400).json({
        message:
          "An invoice already exists for this sales order",
      });
    }

    let subtotal = 0;
    let tax = 0;

    const invoiceItems =
      salesOrder.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const itemTax = Number(item.tax) || 0;

        const itemSubtotal =
          quantity * unitPrice;

        const itemTotal =
          itemSubtotal + itemTax;

        subtotal += itemSubtotal;
        tax += itemTax;

        return {
          productId: item.productId,
          quantity,
          unitPrice,
          tax: itemTax,
          total: itemTotal,
        };
      });

    const total = subtotal + tax;

    // Create invoice
    const invoice =
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          contactId: salesOrder.contactId,
          salesOrderId: Number(salesOrderId),
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
          status: "UNPAID",
          subtotal,
          tax,
          total,

          items: {
            create: invoiceItems,
          },
        },

        include: {
          contact: true,
          items: true,
        },
      });

    // Find required accounts
    const debtors =
      await prisma.account.findFirst({
        where: {
          name: "Debtors",
        },
      });

    const sales =
      await prisma.account.findFirst({
        where: {
          name: "Sales Income",
        },
      });

    if (!debtors || !sales) {
      return res.status(500).json({
        message:
          "Debtors or Sales Income account not found",
      });
    }

    // Find or create Output Tax account
    let outputTax =
      await prisma.account.findFirst({
        where: {
          name: "Output Tax",
        },
      });

    if (!outputTax) {
      outputTax =
        await prisma.account.create({
          data: {
            name: "Output Tax",
            type: "LIABILITY",
            code: "2100",
          },
        });
    }

    // Find Sales Journal
    const salesJournal =
      await prisma.journal.findFirst({
        where: {
          name: "Sales Journal",
        },
      });

    if (!salesJournal) {
      return res.status(500).json({
        message:
          "Sales Journal not found",
      });
    }

    // Create double-entry journal entry
    const journalItems = [
      {
        accountId: debtors.id,
        debit: total,
        credit: 0,
      },
      {
        accountId: sales.id,
        debit: 0,
        credit: subtotal,
      },
    ];

    // Add tax entry only when tax exists
    if (tax > 0) {
      journalItems.push({
        accountId: outputTax.id,
        debit: 0,
        credit: tax,
      });
    }

    await prisma.journalEntry.create({
      data: {
        journalId: salesJournal.id,
        date: new Date(),
        reference: invoiceNumber,
        description:
          `Sales Invoice ${invoiceNumber}`,

        items: {
          create: journalItems,
        },
      },
    });

    // Update sales order
    await prisma.salesOrder.update({
      where: {
        id: Number(salesOrderId),
      },
      data: {
        status: "CONFIRMED",
      },
    });

    res.status(201).json({
      message:
        "Invoice created and accounting entry posted successfully",
      invoice,
    });
  } catch (error) {
    console.error(
      "CREATE INVOICE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create invoice",
      error: error.message,
    });
  }
});

// UPDATE invoice status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const invoice =
      await prisma.invoice.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          status,
        },
      });

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update invoice status",
    });
  }
});

module.exports = router;