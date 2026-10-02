const express = require("express");

const router =
  express.Router();

  const {
  
  loginApplicant
} = require(
  "../controllers/applicantController"
);
/*
==================================================
UPLOAD MIDDLEWARE
==================================================
*/

const upload = require(
  "../middlewares/uploadMiddleware"
);

/*
==================================================
CONTROLLERS
==================================================
*/

const {
  createApplicant,
  getAllApplicants,
  getSingleApplicant,
} = require(
  "../controllers/applicantController"
);

/*
==================================================
CREATE APPLICANT
==================================================
*/

router.post(
  "/create",

  upload.fields([
    {
      name:
        "profileImage",

      maxCount: 1,
    },

    {
      name:
        "resumePdf",

      maxCount: 1,
    },
  ]),

  createApplicant
);

/*
==================================================
GET ALL APPLICANTS
==================================================
*/

router.get(
  "/",
  getAllApplicants
);

/*
==================================================
GET SINGLE APPLICANT
==================================================
*/
router.post(
  "/login",
  loginApplicant
);

router.get(
  "/:id",
  getSingleApplicant
);



/*
==================================================
EXPORT
==================================================
*/

module.exports = router;