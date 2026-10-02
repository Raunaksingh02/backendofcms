const Enrollment = require(
  "../models/Enrollment"
);

const Applicant = require(
  "../models/Applicant"
);

const Course = require(
  "../models/Course"
);

/*
==================================================
CREATE ENROLLMENT
==================================================
*/

exports.createEnrollment =
  async (req, res) => {
    try {
      const {
        applicant,
        course,
        paymentStatus,
        amountPaid,
      } = req.body;

      /*
      ==========================================
      VALIDATION
      ==========================================
      */

      if (!applicant || !course) {
        return res.status(400).json({
          success: false,

          message:
            "Applicant and Course required",
        });
      }

      /*
      ==========================================
      CHECK APPLICANT
      ==========================================
      */

      const applicantExists =
        await Applicant.findById(
          applicant
        );

      if (!applicantExists) {
        return res.status(404).json({
          success: false,

          message:
            "Applicant Not Found",
        });
      }

      /*
      ==========================================
      CHECK COURSE
      ==========================================
      */

      const courseExists =
        await Course.findById(course);

      if (!courseExists) {
        return res.status(404).json({
          success: false,

          message:
            "Course Not Found",
        });
      }

      /*
      ==========================================
      CREATE ENROLLMENT
      ==========================================
      */

      const enrollment =
        await Enrollment.create({
          applicant,
          course,
          paymentStatus,
          amountPaid,
        });

      res.status(201).json({
        success: true,

        message:
          "Enrollment Created Successfully",

        enrollment,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

/*
==================================================
GET ALL ENROLLMENTS
==================================================
*/

exports.getAllEnrollments =
  async (req, res) => {
    try {
      const enrollments =
        await Enrollment.find()

          .populate(
            "applicant",
            "fullName email"
          )

          .populate(
            "course",
            "title price"
          )

          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        total:
          enrollments.length,
        enrollments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

/*
==================================================
GET SINGLE ENROLLMENT
==================================================
*/

exports.getSingleEnrollment =
  async (req, res) => {
    try {
      const enrollment =
        await Enrollment.findById(
          req.params.id
        )

          .populate("applicant")

          .populate("course");

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment Not Found",
        });
      }

      res.status(200).json({
        success: true,
        enrollment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };