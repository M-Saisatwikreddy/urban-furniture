const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all active accounts
router.get("/", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    res.json(accounts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch accounts",
    });
  }
});

// GET one account
router.get("/:id", async (req, res) => {
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json(account);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch account",
    });
  }
});

// CREATE account
router.post("/", async (req, res) => {
  try {
    const { name, type, code } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Account name and type are required",
      });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        code: code || null,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create account",
    });
  }
});

// UPDATE account
router.put("/:id", async (req, res) => {
  try {
    const account = await prisma.account.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        type: req.body.type,
        code: req.body.code,
      },
    });

    res.json(account);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update account",
    });
  }
});

// DEACTIVATE account
router.delete("/:id", async (req, res) => {
  try {
    const account = await prisma.account.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        isActive: false,
      },
    });

    res.json({
      message: "Account deactivated successfully",
      account,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to deactivate account",
    });
  }
});

module.exports = router;