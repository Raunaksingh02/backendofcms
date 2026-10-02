const express = require("express");

const router = express.Router();

const {
  createEnrollment,
  getAllEnrollments,
  getSingleEnrollment,
} = require(
  "../controllers/enrollmentController"
);

router.post(
  "/create",
  createEnrollment
);

router.get(
  "/",
  getAllEnrollments
);

router.get(
  "/:id",
  getSingleEnrollment
);

module.exports = router;


