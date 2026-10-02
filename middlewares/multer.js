const multer = require("multer");

/*
==================================================
MEMORY STORAGE
==================================================
*/

const storage =
  multer.memoryStorage();

/*
==================================================
FILE FILTER
==================================================
*/

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    /*
    ==========================================
    IMAGES
    ==========================================
    */

    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",

    /*
    ==========================================
    PDF
    ==========================================
    */

    "application/pdf",

    /*
    ==========================================
    VIDEOS
    ==========================================
    */

    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only Image, PDF and Video files are allowed"
      ),
      false
    );
  }
};

/*
==================================================
UPLOAD
==================================================
*/

const upload = multer({
  storage,

  limits: {
    fileSize:
      500 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = upload;