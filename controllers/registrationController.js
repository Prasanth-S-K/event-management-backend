// root\server\controllers\registrationController.js

const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const registerEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    const event = await Event.findById(eventId).session(session);

    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.dateTime < new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Event already ended" });
    }

    const existing = await Registration.findOne({
      user: userId,
      event: eventId,
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Already registered" });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        registeredCount: { $lt: event.capacity },
      },
      {
        $inc: { registeredCount: 1 },
        $addToSet: { registeredUsers: userId },
      },
      { new: true, session },
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Event is full" });
    }

    await Registration.create([{ user: userId, event: eventId }], { session });

    await mongoose
      .model("User")
      .findByIdAndUpdate(
        userId,
        { $addToSet: { registeredEvents: eventId } },
        { session },
      );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      return res.status(400).json({ message: "Already registered" });
    }

    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
    }).session(session);

    if (!registration) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Registration not found" });
    }

    await Registration.deleteOne({ _id: registration._id }, { session });

    await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $gt: 0 } },
      {
        $inc: { registeredCount: -1 },
        $pull: { registeredUsers: userId },
      },
      { session },
    );

    await mongoose
      .model("User")
      .findByIdAndUpdate(
        userId,
        { $pull: { registeredEvents: eventId } },
        { session },
      );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({ message: "Cancel failed" });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

module.exports = {
  registerEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
};
