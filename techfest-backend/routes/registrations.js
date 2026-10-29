const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
    try {
        const { eventId } = req.body;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.seats <= 0) {
            return res.status(400).json({
                message: "No seats available"
            });
        }

        const existingRegistration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: "Already registered for this event"
            });
        }

        const registration = new Registration({
            user: req.user.userId,
            event: eventId
        });

        await registration.save();

        event.seats -= 1;
        await event.save();

        res.status(201).json({
            message: "Registration successful",
            registration
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

console.log("ROUTER TYPE:", typeof router);
router.get("/my", auth, async (req, res) => {
    console.log("MY REGISTRATIONS ROUTE LOADED");
    try {
        const registrations = await Registration.find({
            user: req.user.userId
        }).populate("event");

        res.json(registrations);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
module.exports = router;