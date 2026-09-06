const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all journals
router.get("/", async (req, res) => {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(journals);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch journals",
    });
  }
});

// GET one journal
router.get("/:id", async (req, res) => {
  try {
    const journal = await prisma.journal.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!journal) {
      return res.status(404).json({
        message: "Journal not found",
      });
    }

    res.json(journal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch journal",
    });
  }
});

// CREATE journal
router.post("/", async (req, res) => {
  try {
    const { name, type, defaultAccountId } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Journal name and type are required",
      });
    }

    const allowedTypes = [
      "SALES",
      "PURCHASE",
      "BANK",
      "CASH",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid journal type",
      });
    }

    const journal = await prisma.journal.create({
      data: {
        name,
        type,
        defaultAccountId:
          defaultAccountId !== undefined &&
          defaultAccountId !== ""
            ? Number(defaultAccountId)
            : null,
      },
    });

    res.status(201).json(journal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create journal",
    });
  }
});

// UPDATE journal
router.put("/:id", async (req, res) => {
  try {
    const { name, type, defaultAccountId } = req.body;

    const journal = await prisma.journal.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name,
        type,
        defaultAccountId:
          defaultAccountId !== undefined &&
          defaultAccountId !== ""
            ? Number(defaultAccountId)
            : null,
      },
    });

    res.json(journal);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update journal",
    });
  }
});

// DELETE journal
router.delete("/:id", async (req, res) => {
  try {
    await prisma.journal.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      message: "Journal deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete journal",
    });
  }
});

module.exports = router;