const slugify = require("slugify");


const Course = require(
  "../models/Course"
);

const uploadToCloudinary =
  require(
    "../utils/uploadToCloudinary"
  );

/*
==================================================
CREATE COURSE
==================================================
*/


/*
==================================================
GET ALL COURSES
==================================================
*/

/*
==================================================
GET SINGLE COURSE
==================================================
*/

exports.getSingleCourse =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      /*
      ==========================================
      FIND COURSE
      ==========================================
      */

      const course =
        await Course.findById(
          id
        );

      /*
      ==========================================
      COURSE NOT FOUND
      ==========================================
      */

      if (!course) {
        return res.status(404).json({
          success: false,

          message:
            "Course not found",
        });
      }

      /*
      ==========================================
      RESPONSE
      ==========================================
      */

      res.status(200).json({
        success: true,

        course,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

exports.getAllCourses =
  async (req, res) => {
    try {
      /*
      ==========================================
      SEARCH + FILTER
      ==========================================
      */

      const keyword =
        req.query.keyword || "";

      const category =
        req.query.category || "";

      /*
      ==========================================
      QUERY OBJECT
      ==========================================
      */

      const query = {};

      if (keyword) {
        query.title = {
          $regex: keyword,
          $options: "i",
        };
      }

      if (category) {
        query.category =
          category;
      }

      /*
      ==========================================
      FETCH ALL COURSES
      ==========================================
      */

      const courses =
        await Course.find(query)

          .select(
            "-reviews"
          )

          .sort({
            createdAt: -1,
          });

      /*
      ==========================================
      RESPONSE
      ==========================================
      */

      res.status(200).json({
        success: true,

        totalCourses:
          courses.length,

        courses,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

exports.createCourse =
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        price,
      } = req.body;

      /*
      ==========================================
      VALIDATION
      ==========================================
      */

      if (
        !title ||
        !description ||
        !price
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required fields",
        });
      }

      /*
      ==========================================
      POSTER UPLOAD
      ==========================================
      */

      let posterData = {};

      if (
        req.files &&
        req.files.poster
      ) {
        const poster =
          req.files.poster[0];

        const result =
          await uploadToCloudinary(
            poster,
            "lms/course-posters",
            "image"
          );

        posterData = {
          url: result.url,

          publicId:
            result.publicId,
        };
      }

      /*
      ==========================================
      CREATE COURSE
      ==========================================
      */

    const course =
  await Course.create({
    title,

    slug: slugify(title, {
      lower: true,
      strict: true,
    }),

    description,

    category,

    price,

    poster: posterData,
  });

      res.status(201).json({
        success: true,

        message:
          "Course created successfully",

        course,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };

/*
==================================================
ADD LECTURE TO COURSE
==================================================
*/

exports.addLectureToCourse =
  async (req, res) => {
    try {
      const { courseId } =
        req.params;

      const {
        title,
        duration,
        isPreviewFree,
      } = req.body;

      /*
      ==========================================
      FIND COURSE
      ==========================================
      */

      const course =
        await Course.findById(
          courseId
        );

      if (!course) {
        return res.status(404).json({
          success: false,

          message:
            "Course not found",
        });
      }

      /*
      ==========================================
      VIDEO VALIDATION
      ==========================================
      */

      if (
        !req.files ||
        !req.files.video
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Video file is required",
        });
      }

      const video =
        req.files.video[0];

      /*
      ==========================================
      VIDEO UPLOAD
      ==========================================
      */

      const result =
        await uploadToCloudinary(
          video,
          "lms/course-videos",
          "video"
        );

      /*
      ==========================================
      PUSH VIDEO
      ==========================================
      */

      course.videos.push({
        title,

        videoUrl:
          result.url,

        publicId:
          result.publicId,

        duration,

        isPreviewFree,
      });

      await course.save();

      res.status(200).json({
        success: true,

        message:
          "Lecture added successfully",

        course,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,

        message:
          error.message,
      });
    }
  };