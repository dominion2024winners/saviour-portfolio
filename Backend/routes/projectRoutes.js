const express = require("express");
const mongoose = require("mongoose");
const { Readable } = require("stream");
const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const uploadProjectFiles = require("../middleware/uploadProjectFiles");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
============================================================
UPLOAD BUFFER TO CLOUDINARY
============================================================
*/

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio/projects",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

/*
============================================================
DELETE FILE FROM CLOUDINARY
============================================================
*/

const deleteFromCloudinary = async (file) => {
  if (!file?.publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      file.publicId,
      {
        resource_type: "raw",
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error.message
    );
  }
};

/*
============================================================
CONVERT TECHNOLOGIES TO ARRAY
============================================================
*/

const parseTechnologies = (technologies) => {
  if (!technologies) {
    return [];
  }

  if (Array.isArray(technologies)) {
    return technologies
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(technologies)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/*
============================================================
GET ALL PUBLISHED PROJECTS
============================================================
*/

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        projects: [],
        message: "Database unavailable. Showing empty project list.",
      });
    }

    const projects = await Project.find({
      published: true,
    }).sort({
      featured: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(
      "Get projects error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load projects.",
    });
  }
});

/*
============================================================
GET A SINGLE PUBLISHED PROJECT
============================================================
*/

router.get("/:projectId/files/:fileId/download", async (req, res) => {
  try {
    if (
      mongoose.connection.readyState !== 1 ||
      !mongoose.isValidObjectId(req.params.projectId) ||
      !mongoose.isValidObjectId(req.params.fileId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Project file not found.",
      });
    }

    const project = await Project.findOne({
      _id: req.params.projectId,
      published: true,
      "files._id": req.params.fileId,
    }).select("files");

    const file = project?.files.id(req.params.fileId);

    if (!file?.url) {
      return res.status(404).json({
        success: false,
        message: "Project file not found.",
      });
    }

    const upstream = await fetch(file.url);

    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({
        success: false,
        message: "Project file is temporarily unavailable.",
      });
    }

    const safeName = (file.name || "project-file")
      .replace(/["\r\n]/g, "")
      .trim() || "project-file";

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    );
    res.setHeader(
      "Content-Type",
      file.type || upstream.headers.get("content-type") || "application/octet-stream"
    );

    const contentLength = upstream.headers.get("content-length");

    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    return Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error("Download project file error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download project file.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        project: null,
        message: "Database unavailable. Project details are unavailable.",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      published: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project by id error:", error);

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to load project details.",
    });
  }
});

/*
============================================================
GET ALL PROJECTS FOR ADMIN
============================================================
*/

router.get(
  "/admin/all",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const projects = await Project.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        projects,
      });
    } catch (error) {
      console.error(
        "Admin get projects error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load projects.",
      });
    }
  }
);

/*
============================================================
CREATE PROJECT + UPLOAD FILES
============================================================
*/

router.post(
  "/",
  protect,
  adminOnly,
  uploadProjectFiles.array("projectFiles", 10),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        technologies,
        image,
        liveUrl,
        githubUrl,
        featured,
        published,
      } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description and category are required.",
        });
      }

      const files = [];

      /*
       * Upload selected project files
       */

      if (
        req.files &&
        req.files.length > 0
      ) {
        for (const file of req.files) {
          const result =
            await uploadToCloudinary(file);

          files.push({
            name: file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            type: file.mimetype,
            size: file.size,
          });
        }
      }

      const technologyList =
        parseTechnologies(
          technologies
        );

      const project =
        await Project.create({
          title: title.trim(),

          description:
            description.trim(),

          category:
            category.trim(),

          technologies:
            technologyList,

          image:
            image
              ? image.trim()
              : "",

          liveUrl:
            liveUrl
              ? liveUrl.trim()
              : "",

          githubUrl:
            githubUrl
              ? githubUrl.trim()
              : "",

          files,

          featured:
            featured === true ||
            featured === "true",

          published:
            published === false ||
            published === "false"
              ? false
              : true,
        });

      res.status(201).json({
        success: true,
        message:
          "Project created successfully.",
        project,
      });
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create project.",
      });
    }
  }
);

/*
============================================================
UPDATE PROJECT + ADD NEW FILES
============================================================

This endpoint:

✓ Updates project information
✓ Updates title
✓ Updates description
✓ Updates category
✓ Updates technologies
✓ Updates image URL
✓ Updates live URL
✓ Updates GitHub URL
✓ Updates featured status
✓ Updates published status
✓ Adds new uploaded files
✓ Preserves existing uploaded files

Existing files are NOT deleted during an update.

Use:

PUT /api/projects/:id
Authorization: Bearer <adminToken>

Form field for new files:

projectFiles
============================================================
*/

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadProjectFiles.array(
    "projectFiles",
    10
  ),
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      const {
        title,
        description,
        category,
        technologies,
        image,
        liveUrl,
        githubUrl,
        featured,
        published,
      } = req.body;

      /*
      --------------------------------------------------------
      VALIDATE REQUIRED FIELDS
      --------------------------------------------------------
      */

      if (
        !title ||
        !description ||
        !category
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description and category are required.",
        });
      }

      /*
      --------------------------------------------------------
      UPDATE BASIC INFORMATION
      --------------------------------------------------------
      */

      project.title =
        title.trim();

      project.description =
        description.trim();

      project.category =
        category.trim();

      project.technologies =
        parseTechnologies(
          technologies
        );

      project.image =
        image
          ? image.trim()
          : "";

      project.liveUrl =
        liveUrl
          ? liveUrl.trim()
          : "";

      project.githubUrl =
        githubUrl
          ? githubUrl.trim()
          : "";

      /*
      --------------------------------------------------------
      UPDATE BOOLEAN VALUES
      --------------------------------------------------------
      */

      project.featured =
        featured === true ||
        featured === "true";

      project.published =
        published === false ||
        published === "false"
          ? false
          : true;

      /*
      --------------------------------------------------------
      UPLOAD NEW FILES
      --------------------------------------------------------

      Existing files remain untouched.

      New files are appended to the existing
      project.files array.
      --------------------------------------------------------
      */

      if (
        req.files &&
        req.files.length > 0
      ) {
        for (const file of req.files) {
          const result =
            await uploadToCloudinary(file);

          project.files.push({
            name: file.originalname,
            url: result.secure_url,
            publicId:
              result.public_id,
            type: file.mimetype,
            size: file.size,
          });
        }
      }

      /*
      --------------------------------------------------------
      SAVE UPDATED PROJECT
      --------------------------------------------------------
      */

      await project.save();

      res.status(200).json({
        success: true,
        message:
          "Project updated successfully.",
        project,
      });
    } catch (error) {
      console.error(
        "Update project error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update project.",
      });
    }
  }
);

/*
============================================================
DELETE PROJECT
============================================================
*/

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      /*
       * Delete all uploaded files
       * from Cloudinary.
       */

      for (const file of
        project.files || []) {
        await deleteFromCloudinary(
          file
        );
      }

      await Project.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message:
          "Project deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete project.",
      });
    }
  }
);

/*
============================================================
DELETE ONE PROJECT FILE
============================================================
*/

router.delete(
  "/:projectId/files/:fileId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      const file =
        project.files.id(
          req.params.fileId
        );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found.",
        });
      }

      /*
       * Remove file from Cloudinary.
       */

      await deleteFromCloudinary(
        file
      );

      /*
       * Remove file from MongoDB.
       */

      file.deleteOne();

      await project.save();

      res.status(200).json({
        success: true,
        message:
          "Project file deleted successfully.",
        project,
      });
    } catch (error) {
      console.error(
        "Delete project file error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete project file.",
      });
    }
  }
);

module.exports = router;