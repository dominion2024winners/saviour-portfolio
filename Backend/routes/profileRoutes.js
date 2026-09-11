const express = require("express");
const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");
const uploadProfileImage = require("../middleware/uploadProfileImage");
const uploadCv = require("../middleware/uploadCv");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
============================================================
GET PROFILE
============================================================
*/

router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        profile: {
          profileImage: "",
          profileImagePublicId: "",
          cvUrl: "",
          cvPublicId: "",
          cvName: "",
          email: "",
        },
        message: "Database unavailable. Using empty profile state.",
      });
    }

    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        profileImage: "",
        profileImagePublicId: "",
        cvUrl: "",
        cvPublicId: "",
        cvName: "",
        email: "",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
});

/*
============================================================
UPLOAD / REPLACE PROFILE IMAGE
============================================================
*/

router.put(
  "/image",
  protect,
  adminOnly,
  uploadProfileImage.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a profile image.",
        });
      }

      /*
       * Only allow image files.
       */

      if (
        !req.file.mimetype.startsWith("image/")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only image files can be used as a profile picture.",
        });
      }

      /*
       * Find existing profile.
       */

      let profile = await Profile.findOne();

      if (!profile) {
        profile = new Profile();
      }

      /*
       * Delete old Cloudinary image first.
       */

      if (profile.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(
            profile.profileImagePublicId,
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
       * Upload new image to Cloudinary.
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
       * Save new image.
       */

      profile.profileImage =
        uploadResult.secure_url;

      profile.profileImagePublicId =
        uploadResult.public_id;

      await profile.save();

      res.status(200).json({
        success: true,
        message:
          "Profile picture updated successfully.",
        profile,
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

router.put("/details", protect, adminOnly, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "A profile email is required.",
      });
    }

    let profile = await Profile.findOne();

    if (!profile) {
      profile = new Profile();
    }

    profile.email = email;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile email saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Profile details update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save profile email.",
    });
  }
});

/*
============================================================
UPLOAD / REPLACE CV
============================================================
*/

router.put(
  "/cv",
  protect,
  adminOnly,
  uploadCv.single("cv"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a CV file.",
        });
      }

      let profile = await Profile.findOne();

      if (!profile) {
        profile = new Profile();
      }

      if (profile.cvPublicId) {
        await cloudinary.uploader.destroy(profile.cvPublicId, {
          resource_type: "raw",
        });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "portfolio/profile",
            resource_type: "raw",
            public_id: `cv-${Date.now()}`,
            use_filename: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      profile.cvUrl = uploadResult.secure_url;
      profile.cvPublicId = uploadResult.public_id;
      profile.cvName = req.file.originalname;
      await profile.save();

      res.status(200).json({
        success: true,
        message: "CV uploaded successfully.",
        profile,
      });
    } catch (error) {
      console.error("CV upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload CV.",
      });
    }
  }
);

/*
============================================================
REMOVE CV
============================================================
*/

router.delete("/cv", protect, adminOnly, async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    if (profile.cvPublicId) {
      await cloudinary.uploader.destroy(profile.cvPublicId, {
        resource_type: "raw",
      });
    }

    profile.cvUrl = "";
    profile.cvPublicId = "";
    profile.cvName = "";
    await profile.save();

    res.status(200).json({
      success: true,
      message: "CV removed successfully.",
      profile,
    });
  } catch (error) {
    console.error("CV removal error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove CV.",
    });
  }
});

/*
============================================================
REMOVE PROFILE IMAGE
============================================================
*/

router.delete(
  "/image",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const profile =
        await Profile.findOne();

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found.",
        });
      }

      /*
       * Delete image from Cloudinary.
       */

      if (profile.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(
            profile.profileImagePublicId,
            {
              resource_type: "image",
            }
          );
        } catch (cloudinaryError) {
          console.error(
            "Cloudinary profile delete error:",
            cloudinaryError.message
          );
        }
      }

      /*
       * Clear image information.
       */

      profile.profileImage = "";
      profile.profileImagePublicId = "";

      await profile.save();

      res.status(200).json({
        success: true,
        message:
          "Profile picture removed successfully.",
        profile,
      });
    } catch (error) {
      console.error(
        "Remove profile image error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to remove profile picture.",
      });
    }
  }
);

module.exports = router;