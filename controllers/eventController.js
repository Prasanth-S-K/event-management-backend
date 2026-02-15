// server/controllers/eventController.js

const Event = require("../models/Event");
const getEvents = async (req, res) => {
  try {
    const { search, category, location, date } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = location;
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);

      query.dateTime = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    }

    const totalEvents = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      name,
      organizer,
      location,
      dateTime,
      description,
      capacity,
      category,
    } = req.body;

    if (
      !name ||
      !organizer ||
      !location ||
      !dateTime ||
      !description ||
      !capacity ||
      !category
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const event = await Event.create({
      name,
      organizer,
      location,
      dateTime,
      description,
      capacity: Number(capacity),
      category,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const {
      name,
      organizer,
      location,
      dateTime,
      description,
      capacity,
      category,
    } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.name = name || event.name;
    event.organizer = organizer || event.organizer;
    event.location = location || event.location;
    event.dateTime = dateTime || event.dateTime;
    event.description = description || event.description;
    event.capacity = capacity ? Number(capacity) : event.capacity;
    event.category = category || event.category;

    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createEvent,
};
