// server/seed/seedEvents.js

const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const Event = require("../models/Event");
const User = require("../models/User");

dotenv.config();
connectDB();

const generateUsers = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  return [
    {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
    {
      name: "Prasanth",
      email: "prasanth@example.com",
      password: hashedPassword,
    },
    {
      name: "Sruthi",
      email: "sruthi@example.com",
      password: hashedPassword,
    },
    {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    },
  ];
};

const generateEvents = (users) => {
  const categories = ["Tech", "Business", "Music", "Workshop"];
  const locations = ["Chennai", "Bangalore", "Hyderabad"];

  const events = [];

  for (let i = 1; i <= 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    events.push({
      name: `Event ${i}`,
      organizer: "Bellcorp",
      location: locations[Math.floor(Math.random() * locations.length)],
      dateTime: new Date(2026, 4, i, 10, 0, 0),
      description: `This is the description for Event ${i}.`,
      capacity: i === 1 ? 1 : 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      createdBy: randomUser._id,
      registeredUsers: [],
      registeredCount: 0,
    });
  }

  return events;
};

const importData = async () => {
  try {
    await Event.deleteMany();
    await User.deleteMany();

    const usersData = await generateUsers();
    const insertedUsers = await User.insertMany(usersData);

    const events = generateEvents(insertedUsers);
    await Event.insertMany(events);

    console.log("Users and Events Seeded Successfully");
    console.log("Login Password for all users: 123456");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Event.deleteMany();
    await User.deleteMany();

    console.log("All Data Cleared Successfully");
    process.exit();
  } catch (error) {
    console.error("Destroy Error:", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
