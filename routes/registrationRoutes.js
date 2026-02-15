// routes/registrationRoutes.js

const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  registerEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
} = require("../controllers/registrationController");

const router = express.Router();

router.get("/me", protect, getMyRegistrations);
router.get("/:eventId/registrations", protect, getEventRegistrations);

router.post("/:eventId", protect, registerEvent);
router.delete("/:eventId", protect, cancelRegistration);

module.exports = router;
