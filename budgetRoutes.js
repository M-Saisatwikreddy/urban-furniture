const express = require("express");
const prisma = require("../db");

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "Budget router is working!" });
});

// Get all analytic accounts
router.get("/analytic-accounts", async (req, res) => {
  try {
    const accounts = await prisma.analyticAccount.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(accounts);
  } catch (error) {
    console.error("Analytic account error:", error);
    res.status(500).json({
      error: "Failed to fetch analytic accounts",
    });
  }
});

// Get all budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        analyticAccount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(budgets);
  } catch (error) {
    console.error("Budget fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch budgets",
    });
  }
});

// Create a budget
router.post("/", async (req, res) => {
  try {
    const {
      name,
      periodStart,
      periodEnd,
      responsiblePerson,
      analyticAccountId,
      plannedAmount,
    } = req.body;

    if (
      !name ||
      !periodStart ||
      !periodEnd ||
      !analyticAccountId ||
      plannedAmount === undefined
    ) {
      return res.status(400).json({
        error: "Please provide all required budget details",
      });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        responsiblePerson: responsiblePerson || null,
        analyticAccountId: Number(analyticAccountId),
        plannedAmount: Number(plannedAmount),
      },
      include: {
        analyticAccount: true,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error("Budget creation error:", error);
    res.status(500).json({
      error: "Failed to create budget",
    });
  }
});

module.exports = router;