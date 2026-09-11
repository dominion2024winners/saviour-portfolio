const express = require("express");
const mongoose = require("mongoose");
const SiteSettings = require("../models/SiteSettings");
const cloudinary = require("../config/cloudinary");
const uploadProjectFiles = require("../middleware/uploadProjectFiles");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
============================================================
GET PUBLIC SITE SETTINGS
============================================================
*/

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        settings: {
          profileImage: "",
          profileImagePublicId: "",
          websiteEnabled: true,
          brandName: "Saviour Nkantion",
          title: "Graphic Designer & Developer",
          heroTitle: "I create digital experiences that stand out.",
          heroDescription:
            "I design and build modern websites, visual identities, digital experiences and creative solutions for brands, businesses and individuals.",
        },
        message: "Database unavailable. Using default site settings.",
      });
    }

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        profileImage: "",
        profileImagePublicId: "",
        websiteEnabled: true,
      });
    }

    res.status(200).json({
      success: true,
      settings: {
        ...settings.toObject(),
        websiteEnabled: settings.websiteEnabled !== false,
      },
    });
  } catch (error) {
    console.error(
      "Get site settings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load site settings.",
    });
  }
});

router.get("/site-status", async (req, res) => {
  try {
    const enabled = req.app.locals.websiteEnabled ?? true;

    if (mongoose.connection.readyState === 1) {
      const settings = await SiteSettings.findOne();

      if (settings) {
        req.app.locals.websiteEnabled = settings.websiteEnabled !== false;
      }
    }

    res.status(200).json({
      success: true,
      siteStatus: {
        websiteEnabled: req.app.locals.websiteEnabled ?? true,
      },
    });
  } catch (error) {
    console.error("Get site status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load site status.",
    });
  }
});

router.put("/site-status", protect, adminOnly, async (req, res) => {
  try {
    const websiteEnabled = req.body?.websiteEnabled !== undefined
      ? Boolean(req.body.websiteEnabled)
      : true;

    req.app.locals.websiteEnabled = websiteEnabled;

    if (mongoose.connection.readyState === 1) {
      let settings = await SiteSettings.findOne();

      if (!settings) {
        settings = await SiteSettings.create({ websiteEnabled });
      } else {
        settings.websiteEnabled = websiteEnabled;
        await settings.save();
      }

      req.app.locals.websiteEnabled = settings.websiteEnabled;

      return res.status(200).json({
        success: true,
        message: websiteEnabled ? "Website enabled successfully." : "Website disabled successfully.",
        siteStatus: {
          websiteEnabled: settings.websiteEnabled,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: websiteEnabled ? "Website enabled successfully." : "Website disabled successfully.",
      siteStatus: {
        websiteEnabled,
      },
    });
  } catch (error) {
    console.error("Update site status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update website status.",
    });
  }
});

/*
============================================================
UPDATE PROFILE PICTURE
============================================================
*/

router.put(
  "/profile-image",
  protect,
  adminOnly,
  uploadProjectFiles.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a profile picture.",
        });
      }

      /*
       * Find existing settings
       */

      let settings = await SiteSettings.findOne();

      if (!settings) {
        settings = new SiteSettings();
      }

      /*
       * Delete previous profile picture
       */

      if (settings.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(
            settings.profileImagePublicId,
            {
              resource_type: "image",
            }
          );
        } catch (cloudinaryError) {
          console.error(
            "Old profile image delete error:",
            cloudinaryError.message
          );
        }
      }

      /*
       * Upload new profile picture
       */

      const uploadResult =
        await new Promise(
          (resolve, reject) => {
            const uploadStream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "portfolio/profile",
                  resource_type: "image",
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                    return;
                  }

                  resolve(result);
                }
              );

            uploadStream.end(
              req.file.buffer
            );
          }
        );

      /*
       * Save new profile image
       */

      settings.profileImage =
        uploadResult.secure_url;

      settings.profileImagePublicId =
        uploadResult.public_id;

      await settings.save();

      res.status(200).json({
        success: true,
        message:
          "Profile picture updated successfully.",
        settings,
      });
    } catch (error) {
      console.error(
        "Update profile image error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update profile picture.",
      });
    }
  }
);

module.exports = router;