const multer = require("multer");

/*
==================================================
MULTER MEMORY STORAGE
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
  /*
  ==========================================
  DEBUG MIME TYPE
  ==========================================
  */

  console.log(
    "Uploaded MIME Type:",
    file.mimetype
  );

  /*
  ==========================================
  ALLOWED FILE TYPES
  ==========================================
  */

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
    "video/x-matroska",
    "video/webm",
    "video/ogg",

    /*
    ==========================================
    FALLBACK
    ==========================================
    */

    "application/octet-stream",
  ];

  /*
  ==========================================
  CHECK FILE TYPE
  ==========================================
  */

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed: ${file.mimetype}`
      ),
      false
    );
  }
};

/*
==================================================
MULTER CONFIG
==================================================
*/

const upload = multer({
  storage,

  /*
  ==========================================
  FILE SIZE LIMIT
  ==========================================
  */

  limits: {
    /*
    ==========================================
    500 MB
    ==========================================
    */

    fileSize:
      500 * 1024 * 1024,
  },

  fileFilter ,
});

module.exports = upload;