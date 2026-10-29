require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const registrationRoutes = require("./routes/registrations");
console.log("REGISTRATION FILE:", require.resolve("./routes/registrations"));
const eventRoutes = require("./routes/events");
const authRoutes = require("./routes/auth");

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("DB error:", err.message));

app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});