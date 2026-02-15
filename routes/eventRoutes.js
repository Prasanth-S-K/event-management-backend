// server/routes/eventRoutes.js

const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, createEvent);

router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;
