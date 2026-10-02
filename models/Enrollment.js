
const mongoose = require("mongoose");

/*
==================================================
ENROLLMENT SCHEMA
==================================================
*/

const enrollmentSchema =
  new mongoose.Schema(
    {
      applicant: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Applicant",

        required: true,
      },

      course: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Course",

        required: true,
      },

      paymentStatus: {
        type: String,

        enum: [
          "Pending",
          "Completed",
          "Failed",
        ],

        default: "Pending",
      },

      amountPaid: {
        type: Number,
        default: 0,
      },

      progressPercentage: {
        type: Number,
        default: 0,
      },

      completedVideos: [String],

      certificateIssued: {
        type: Boolean,
        default: false,
      },

      accessExpired: {
        type: Boolean,
        default: false,
      },
    },

    {
      timestamps: true,

      versionKey: false,
    }
  );

module.exports = mongoose.model(
  "Enrollment",
  enrollmentSchema
);