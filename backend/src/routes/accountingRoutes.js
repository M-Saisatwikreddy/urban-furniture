const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all journal entries
router.get("/entries", async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        journal: true,
        items: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(entries);
  } catch (error) {
    console.error("GET JOURNAL ENTRIES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch journal entries",
      error: error.message,
    });
  }
});

// CREATE journal entry
router.post("/entries", async (req, res) => {
  try {
    const {
      journalId,
      date,
      reference,
      description,
      items,
    } = req.body;

    if (
      !journalId ||
      !items ||
      items.length < 2
    ) {
      return res.status(400).json({
        message:
          "Journal and at least two journal items are required",
      });
    }

    let totalDebit = 0;
    let totalCredit = 0;

    const journalItems = items.map((item) => {
      const debit = Number(item.debit) || 0;
      const credit = Number(item.credit) || 0;

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountId: Number(item.accountId),
        debit,
        credit,
      };
    });

    // Double-entry validation
    if (
      Math.abs(totalDebit - totalCredit) >
      0.01
    ) {
      return res.status(400).json({
        message: "Debit and Credit must be equal",
        totalDebit,
        totalCredit,
      });
    }

    if (totalDebit <= 0) {
      return res.status(400).json({
        message:
          "Journal entry amount must be greater than zero",
      });
    }

    const entry =
      await prisma.journalEntry.create({
        data: {
          journalId: Number(journalId),
          date: date ? new Date(date) : new Date(),
          reference: reference || null,
          description: description || null,

          items: {
            create: journalItems,
          },
        },

        include: {
          journal: true,
          items: {
            include: {
              account: true,
            },
          },
        },
      });

    res.status(201).json({
      message: "Journal entry created successfully",
      entry,
      totalDebit,
      totalCredit,
    });
  } catch (error) {
    console.error(
      "CREATE JOURNAL ENTRY ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create journal entry",
      error: error.message,
    });
  }
});

// GET account ledger
router.get("/ledger/:accountId", async (req, res) => {
  try {
    const accountId = Number(req.params.accountId);

    if (Number.isNaN(accountId)) {
      return res.status(400).json({
        message: "Invalid account ID",
      });
    }

    const account =
      await prisma.account.findUnique({
        where: {
          id: accountId,
        },
      });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const items =
      await prisma.journalItem.findMany({
        where: {
          accountId,
        },
        include: {
          journalEntry: {
            include: {
              journal: true,
            },
          },
        },
        orderBy: {
          journalEntry: {
            date: "asc",
          },
        },
      });

    let balance = 0;

    const ledger = items.map((item) => {
      balance +=
        Number(item.debit) -
        Number(item.credit);

      return {
        id: item.id,
        date: item.journalEntry.date,
        reference:
          item.journalEntry.reference,
        description:
          item.journalEntry.description,
        debit: Number(item.debit),
        credit: Number(item.credit),
        balance,
      };
    });

    res.json({
      account,
      ledger,
    });
  } catch (error) {
    console.error(
      "GET LEDGER ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch ledger",
      error: error.message,
    });
  }
});

module.exports = router;