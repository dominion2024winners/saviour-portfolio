const express = require("express");
const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const cloudinary = require("../config/cloudinary");
const uploadProfileImage = require("../middleware/uploadProfileImage");

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
        },
        message: "Database unavailable. Using empty profile state.",
      });
    }

    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        profileImage: "",
        profileImagePublicId: "",
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