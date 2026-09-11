const express = require("express");
const mongoose = require("mongoose");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

const allowedEventTypes = [
  "page_view",
  "project_view",
  "blog_view",
  "contact_submit",
];

router.post("/events", async (req, res) => {
  try {
    const { type, path, contentId, contentTitle } = req.body;

    if (!allowedEventTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analytics event type.",
      });
    }

    await AnalyticsEvent.create({
      type,
      path: String(path || "").slice(0, 240),
      contentId: String(contentId || "").slice(0, 120),
      contentTitle: String(contentTitle || "").slice(0, 240),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Record analytics event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record analytics event.",
    });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalViews: 0,
          projectViews: 0,
          blogViews: 0,
          leads: 0,
          topProjects: [],
          topPosts: [],
          recentEvents: [],
        },
        message: "Database unavailable. Showing empty analytics.",
      });
    }

    const [summary, topProjects, topPosts, recentEvents] =
      await Promise.all([
        AnalyticsEvent.aggregate([
          {
            $group: {
              _id: null,
              totalViews: {
                $sum: {
                  $cond: [
                    { $in: ["$type", ["page_view", "project_view", "blog_view"]] },
                    1,
                    0,
                  ],
                },
              },
              projectViews: {
                $sum: {
                  $cond: [{ $eq: ["$type", "project_view"] }, 1, 0],
                },
              },
              blogViews: {
                $sum: {
                  $cond: [{ $eq: ["$type", "blog_view"] }, 1, 0],
                },
              },
              leads: {
                $sum: {
                  $cond: [{ $eq: ["$type", "contact_submit"] }, 1, 0],
                },
              },
            },
          },
        ]),
        AnalyticsEvent.aggregate([
          { $match: { type: "project_view" } },
          {
            $group: {
              _id: "$contentId",
              title: { $first: "$contentTitle" },
              views: { $sum: 1 },
            },
          },
          { $sort: { views: -1 } },
          { $limit: 5 },
        ]),
        AnalyticsEvent.aggregate([
          { $match: { type: "blog_view" } },
          {
            $group: {
              _id: "$contentId",
              title: { $first: "$contentTitle" },
              views: { $sum: 1 },
            },
          },
          { $sort: { views: -1 } },
          { $limit: 5 },
        ]),
        AnalyticsEvent.find()
          .sort({ createdAt: -1 })
          .limit(8)
          .select("type path contentTitle createdAt"),
      ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalViews: summary[0]?.totalViews || 0,
        projectViews: summary[0]?.projectViews || 0,
        blogViews: summary[0]?.blogViews || 0,
        leads: summary[0]?.leads || 0,
        topProjects,
        topPosts,
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics.",
    });
  }
});

module.exports = router;
