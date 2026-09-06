const express = require("express");
const prisma = require("../db");

const router = express.Router();

// ================================
// PROFIT & LOSS REPORT
// ================================
router.get("/profit-loss", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        type: {
          in: ["INCOME", "EXPENSE"],
        },
      },
      include: {
        journalItems: true,
      },
    });

    const income = [];
    const expenses = [];

    let totalIncome = 0;
    let totalExpenses = 0;

    accounts.forEach((account) => {
      let balance = 0;

      account.journalItems.forEach((item) => {
        balance += Number(item.credit) - Number(item.debit);
      });

      if (account.type === "INCOME") {
        income.push({
          account: account.name,
          amount: balance,
        });

        totalIncome += balance;
      }

      if (account.type === "EXPENSE") {
        const expenseAmount = -balance;

        expenses.push({
          account: account.name,
          amount: expenseAmount,
        });

        totalExpenses += expenseAmount;
      }
    });

    const netProfit = totalIncome - totalExpenses;

    res.json({
      income,
      expenses,
      totalIncome,
      totalExpenses,
      netProfit,
    });
  } catch (error) {
    console.error("PROFIT LOSS ERROR:", error);

    res.status(500).json({
      message: "Failed to generate Profit & Loss report",
      error: error.message,
    });
  }
});

// ================================
// BALANCE SHEET REPORT
// ================================
router.get("/balance-sheet", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        type: {
          in: ["ASSET", "LIABILITY", "CAPITAL"],
        },
      },
      include: {
        journalItems: true,
      },
    });

    const assets = [];
    const liabilities = [];
    const capital = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalCapital = 0;

    accounts.forEach((account) => {
      let debit = 0;
      let credit = 0;

      account.journalItems.forEach((item) => {
        debit += Number(item.debit);
        credit += Number(item.credit);
      });

      let balance;

      if (account.type === "ASSET") {
        balance = debit - credit;

        assets.push({
          account: account.name,
          amount: balance,
        });

        totalAssets += balance;
      }

      if (account.type === "LIABILITY") {
        balance = credit - debit;

        liabilities.push({
          account: account.name,
          amount: balance,
        });

        totalLiabilities += balance;
      }

      if (account.type === "CAPITAL") {
        balance = credit - debit;

        capital.push({
          account: account.name,
          amount: balance,
        });

        totalCapital += balance;
      }
    });

    res.json({
      assets,
      liabilities,
      capital,
      totalAssets,
      totalLiabilities,
      totalCapital,
      totalLiabilitiesAndCapital:
        totalLiabilities + totalCapital,
    });
  } catch (error) {
    console.error("BALANCE SHEET ERROR:", error);

    res.status(500).json({
      message: "Failed to generate Balance Sheet",
      error: error.message,
    });
  }
});

// ================================
// STOCK REPORT
// ================================
router.get("/stock", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    const stock = products.map((product) => ({
      id: product.id,
      name: product.name,
      type: product.type,
      category: product.category,
      quantity: product.stock,
      purchasePrice: product.purchasePrice,
      salesPrice: product.salesPrice,
      stockValue:
        Number(product.stock) *
        Number(product.purchasePrice),
    }));

    const totalStockValue = stock.reduce(
      (total, product) =>
        total + product.stockValue,
      0
    );

    res.json({
      products: stock,
      totalStockValue,
    });
  } catch (error) {
    console.error("STOCK REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate Stock Report",
      error: error.message,
    });
  }
});

// ================================
// BUDGET REPORT
// ================================
router.get("/budget", async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        analyticAccount: true,
      },
      orderBy: {
        periodStart: "desc",
      },
    });

    const report = budgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
      analyticAccount:
        budget.analyticAccount.name,
      type: budget.analyticAccount.type,
      periodStart: budget.periodStart,
      periodEnd: budget.periodEnd,
      responsiblePerson:
        budget.responsiblePerson,
      plannedAmount: budget.plannedAmount,

      // Actual amount will be connected
      // to accounting transactions later.
      actualAmount: 0,

      variance: budget.plannedAmount,
    }));

    res.json(report);
  } catch (error) {
    console.error("BUDGET REPORT ERROR:", error);

    res.status(500).json({
      message: "Failed to generate Budget Report",
      error: error.message,
    });
  }
});

module.exports = router;