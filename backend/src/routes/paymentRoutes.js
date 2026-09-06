const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        contact: true,
        invoice: true,
        vendorBill: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(payments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
});

// GET one payment
router.get("/:id", async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        contact: true,
        invoice: true,
        vendorBill: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch payment",
    });
  }
});

// CREATE PAYMENT
router.post("/", async (req, res) => {
  try {
    const {
      paymentNumber,
      contactId,
      invoiceId,
      vendorBillId,
      method,
      amount,
      reference,
    } = req.body;

    const paymentAmount = Number(amount);

    if (
      !paymentNumber ||
      !contactId ||
      !method ||
      !amount
    ) {
      return res.status(400).json({
        message:
          "Payment number, contact, method and amount are required",
      });
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero",
      });
    }

    if (!invoiceId && !vendorBillId) {
      return res.status(400).json({
        message:
          "Invoice or Vendor Bill is required",
      });
    }

    if (invoiceId && vendorBillId) {
      return res.status(400).json({
        message:
          "Payment cannot belong to both invoice and vendor bill",
      });
    }

    // ------------------------------------------------
    // FIND CONTACT
    // ------------------------------------------------

    const contact = await prisma.contact.findUnique({
      where: {
        id: Number(contactId),
      },
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    // ------------------------------------------------
    // PREVENT DUPLICATE PAYMENT NUMBER
    // ------------------------------------------------

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          paymentNumber,
        },
      });

    if (existingPayment) {
      return res.status(400).json({
        message:
          "Payment number already exists",
      });
    }

    let invoice = null;
    let vendorBill = null;

    // ------------------------------------------------
    // INVOICE PAYMENT
    // ------------------------------------------------

    if (invoiceId) {
      invoice =
        await prisma.invoice.findUnique({
          where: {
            id: Number(invoiceId),
          },
        });

      if (!invoice) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      const remaining =
        Number(invoice.total) -
        Number(invoice.paidAmount);

      if (paymentAmount > remaining) {
        return res.status(400).json({
          message:
            "Payment amount exceeds remaining invoice amount",
          remainingAmount: remaining,
        });
      }
    }

    // ------------------------------------------------
    // VENDOR BILL PAYMENT
    // ------------------------------------------------

    if (vendorBillId) {
      vendorBill =
        await prisma.vendorBill.findUnique({
          where: {
            id: Number(vendorBillId),
          },
        });

      if (!vendorBill) {
        return res.status(404).json({
          message: "Vendor bill not found",
        });
      }

      const remaining =
        Number(vendorBill.total) -
        Number(vendorBill.paidAmount);

      if (paymentAmount > remaining) {
        return res.status(400).json({
          message:
            "Payment amount exceeds remaining vendor bill amount",
          remainingAmount: remaining,
        });
      }
    }

    // ------------------------------------------------
    // FIND CASH / BANK ACCOUNT
    // ------------------------------------------------

    const paymentAccountName =
      method === "BANK" ? "Bank" : "Cash";

    const paymentAccount =
      await prisma.account.findFirst({
        where: {
          name: paymentAccountName,
        },
      });

    if (!paymentAccount) {
      return res.status(500).json({
        message:
          `${paymentAccountName} account not found`,
      });
    }

    // ------------------------------------------------
    // FIND DEBTORS / CREDITORS
    // ------------------------------------------------

    const debtors =
      await prisma.account.findFirst({
        where: {
          name: "Debtors",
        },
      });

    const creditors =
      await prisma.account.findFirst({
        where: {
          name: "Creditors",
        },
      });

    if (!debtors || !creditors) {
      return res.status(500).json({
        message:
          "Debtors or Creditors account not found",
      });
    }

    // ------------------------------------------------
    // FIND CASH / BANK JOURNAL
    // ------------------------------------------------

    const journal =
      await prisma.journal.findFirst({
        where: {
          name:
            method === "BANK"
              ? "Bank Journal"
              : "Cash Journal",
        },
      });

    if (!journal) {
      return res.status(500).json({
        message:
          "Cash or Bank Journal not found",
      });
    }

    // ------------------------------------------------
    // CREATE PAYMENT
    // ------------------------------------------------

    const payment =
      await prisma.payment.create({
        data: {
          paymentNumber,
          contactId: Number(contactId),
          invoiceId: invoiceId
            ? Number(invoiceId)
            : null,
          vendorBillId: vendorBillId
            ? Number(vendorBillId)
            : null,
          method,
          amount: paymentAmount,
          reference: reference || null,
        },
        include: {
          contact: true,
          invoice: true,
          vendorBill: true,
        },
      });

    // ------------------------------------------------
    // UPDATE INVOICE
    // ------------------------------------------------

    if (invoice) {
      const newPaidAmount =
        Number(invoice.paidAmount) +
        paymentAmount;

      let status = "PARTIALLY_PAID";

      if (newPaidAmount >= Number(invoice.total)) {
        status = "PAID";
      }

      await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          paidAmount: newPaidAmount,
          status,
        },
      });
    }

    // ------------------------------------------------
    // UPDATE VENDOR BILL
    // ------------------------------------------------

    if (vendorBill) {
      const newPaidAmount =
        Number(vendorBill.paidAmount) +
        paymentAmount;

      let status = "PARTIALLY_PAID";

      if (
        newPaidAmount >=
        Number(vendorBill.total)
      ) {
        status = "PAID";
      }

      await prisma.vendorBill.update({
        where: {
          id: vendorBill.id,
        },
        data: {
          paidAmount: newPaidAmount,
          status,
        },
      });
    }

    // ------------------------------------------------
    // CREATE DOUBLE-ENTRY ACCOUNTING
    // ------------------------------------------------

    let journalItems;

    if (invoice) {
      // Customer payment:
      //
      // Bank/Cash  DEBIT
      // Debtors    CREDIT

      journalItems = [
        {
          accountId: paymentAccount.id,
          debit: paymentAmount,
          credit: 0,
        },
        {
          accountId: debtors.id,
          debit: 0,
          credit: paymentAmount,
        },
      ];
    } else {
      // Vendor payment:
      //
      // Creditors  DEBIT
      // Bank/Cash  CREDIT

      journalItems = [
        {
          accountId: creditors.id,
          debit: paymentAmount,
          credit: 0,
        },
        {
          accountId: paymentAccount.id,
          debit: 0,
          credit: paymentAmount,
        },
      ];
    }

    await prisma.journalEntry.create({
      data: {
        journalId: journal.id,
        date: new Date(),
        reference: paymentNumber,
        description:
          invoice
            ? `Customer Payment ${paymentNumber}`
            : `Vendor Payment ${paymentNumber}`,

        items: {
          create: journalItems,
        },
      },
    });

    res.status(201).json({
      message:
        "Payment created and accounting entry posted successfully",
      payment,
      accounting: {
        debit: paymentAmount,
        credit: paymentAmount,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
});

module.exports = router;