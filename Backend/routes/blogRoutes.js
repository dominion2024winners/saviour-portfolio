const express = require("express");
const mongoose = require("mongoose");
const BlogPost = require("../models/BlogPost");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

const normalizePostInput = (body) => ({
  title: String(body.title || "").trim(),
  category: String(body.category || "").trim(),
  date: body.date || new Date().toISOString().slice(0, 10),
  readTime: String(body.readTime || "4 min read").trim(),
  excerpt: String(body.excerpt || "").trim(),
  content: String(body.content || "").trim(),
  published: body.published !== false && body.published !== "false",
});

const validatePostInput = (post) => {
  if (!post.title || !post.category || !post.excerpt || !post.content) {
    return "Title, category, excerpt and content are required.";
  }

  return "";
};

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        posts: [],
        message: "Database unavailable. Showing empty article list.",
      });
    }

    const posts = await BlogPost.find({ published: true }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Get published blog posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load blog posts.",
    });
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Admin get blog posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load blog posts.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const post = mongoose.isValidObjectId(req.params.id)
      ? await BlogPost.findOne({
          _id: req.params.id,
          published: true,
        })
      : null;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Get blog post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load blog post.",
    });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const input = normalizePostInput(req.body);
    const validationError = validatePostInput(input);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const post = await BlogPost.create(input);
    return res.status(201).json({
      success: true,
      message: "Blog post created successfully.",
      post,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog post.",
    });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const input = normalizePostInput(req.body);
    const validationError = validatePostInput(input);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      input,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully.",
      post,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog post.",
    });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog post.",
    });
  }
});

module.exports = router;
