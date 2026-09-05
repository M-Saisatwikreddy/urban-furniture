const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET all contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch contacts",
    });
  }
});

// GET one contact
router.get("/:id", async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch contact",
    });
  }
});

// CREATE contact
router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      email,
      mobile,
      address,
      city,
      state,
      pincode,
      profileImage,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        type,
        email,
        mobile,
        address,
        city,
        state,
        pincode,
        profileImage,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create contact",
    });
  }
});

// UPDATE contact
router.put("/:id", async (req, res) => {
  try {
    const contact = await prisma.contact.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update contact",
    });
  }
});

// ARCHIVE contact
router.delete("/:id", async (req, res) => {
  try {
    const contact = await prisma.contact.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        isArchived: true,
      },
    });

    res.json({
      message: "Contact archived successfully",
      contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to archive contact",
    });
  }
});

module.exports = router;