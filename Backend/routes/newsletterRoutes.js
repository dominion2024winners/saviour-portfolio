const express = require("express");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

const router = express.Router();

router.post("/", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }

  try {
    await NewsletterSubscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
    return res.status(201).json({ success: true, message: "You have subscribed to the latest updates." });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return res.status(500).json({ success: false, message: "Unable to subscribe right now." });
  }
});

module.exports = router;
