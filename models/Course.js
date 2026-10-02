const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
    },

    duration: {
      type: String,
    },

    isPreviewFree: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
PDF SCHEMA
==================================================
*/

const pdfSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
REVIEW SCHEMA
==================================================
*/

const reviewSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Applicant",
    },

    studentName: String,

    rating: {
      type: Number,

      min: 1,

      max: 5,
    },

    comment: String,
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
COURSE SCHEMA
==================================================
*/

const courseSchema = new mongoose.Schema(
  {
  

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
  type: String,
  unique: true,
  required: true,
},

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
    },

    category: {
      type: String,
    },

    subCategory: {
      type: String,
    },

    /*
    ==========================================
    PRICING
    ==========================================
    */
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    /*
    ==========================================
    POSTER / THUMBNAIL
    ==========================================
    */

    poster: {
      url: String,

      publicId: String,
    },

    /*
    ==========================================
    INSTRUCTOR
    ==========================================
    */

    instructor: {
      name: String,

      bio: String,

      profileImage: {
        url: String,

        publicId: String,
      },
    },

    /*
    ==========================================
    COURSE DETAILS
    ==========================================
    */

    language: {
      type: String,
      default: "English",
    },

    level: {
      type: String,

      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],

      default: "Beginner",
    },

    courseDuration: {
      type: String,
    },

    certificate: {
      type: Boolean,
      default: true,
    },

    /*
    ==========================================
    REQUIREMENTS
    ==========================================
    */

    requirements: [String],

    /*
    ==========================================
    BENEFITS
    ==========================================
    */

    benefits: [String],

    /*
    ==========================================
    TAGS
    ==========================================
    */

    tags: [String],

    /*
    ==========================================
    PDFs
    ==========================================
    */

    pdfs: [pdfSchema],

    /*
    ==========================================
    VIDEOS
    ==========================================
    */

    videos: [videoSchema],

    /*
    ==========================================
    RATINGS
    ==========================================
    */

    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    reviews: [reviewSchema],

    /*
    ==========================================
    COURSE STATUS
    ==========================================
    */

    isPublished: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
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
  "Course",
  courseSchema
);










