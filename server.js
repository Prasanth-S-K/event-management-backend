// root\server\server.js
// root\server\server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const registrationRoutes = require("./routes/registrationRoutes");
const eventRoutes = require("./routes/eventRoutes");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
