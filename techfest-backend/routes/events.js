const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET one event
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add event
router.post("/", auth, admin, async (req, res) => {
    try {
        const event = new Event(req.body);
        const savedEvent = await event.save();

        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Update event
router.put("/:id", auth, admin, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Delete event
router.delete("/:id", auth, admin, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;