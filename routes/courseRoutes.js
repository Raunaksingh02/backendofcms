const express = require("express");

const router = express.Router();

const {
  createCourse,
  addLectureToCourse,
  getAllCourses,
   getSingleCourse
} = require(
  "../controllers/courseController"
);

const upload = require(
  "../middlewares/uploadMiddleware"
);

/*
==================================================
CREATE COURSE
==================================================
*/

router.post(
  "/create",

  upload.fields([
    {
      name: "poster",
      maxCount: 1,
    },
  ]),

  createCourse
);

/*
==================================================
ADD LECTURE
==================================================
*/

router.post(
  "/add-lecture/:courseId",

  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
  ]),

  addLectureToCourse
);

/*
==================================================
GET ALL COURSES
==================================================
*/

router.get(
  "/all",
  getAllCourses
);


router.get(
  "/:id",
  getSingleCourse
);

module.exports = router;