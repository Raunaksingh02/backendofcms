const mongoose = require("mongoose");

/*
==================================================
EDUCATION SCHEMA
==================================================
*/

const educationSchema = new mongoose.Schema(
  {
    instituteName: String,

    boardOrUniversity: String,

    degree: String,

    specialization: String,

    passingYear: String,

    percentage: String,

    cgpa: String,
  },

  {
    _id: false,
  }
);

/*
==================================================
PROJECT SCHEMA
==================================================
*/

const projectSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    technologiesUsed: [String],

    githubLink: String,

    liveLink: String,
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
EXPERIENCE SCHEMA
==================================================
*/

const experienceSchema = new mongoose.Schema(
  {
    companyName: String,

    role: String,

    duration: String,

    description: String,
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

/*
==================================================
APPLICANT SCHEMA
==================================================
*/

const applicantSchema = new mongoose.Schema(
  {
    /*
    ==========================================
    BASIC DETAILS
    ==========================================
    */

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
    },
    
    referby: {
    type: String,
    },

    referralCode: {
      type: String,
    },

    gender: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },

    /*
    ==========================================
    PROFILE IMAGE
    ==========================================
    */

    profileImage: {
      url: String,

      publicId: String,
    },

    /*
    ==========================================
    ADDRESS
    ==========================================
    */

    address: {
      city: String,

      state: String,

      country: String,

      pincode: String,
    },

    /*
    ==========================================
    EDUCATION
    ==========================================
    */

    tenthEducation: educationSchema,

    twelfthEducation: educationSchema,

    ugEducation: educationSchema,

    pgEducation: educationSchema,

    /*
    ==========================================
    SKILLS
    ==========================================
    */

    skills: [String],

    /*
    ==========================================
    EXPERIENCE
    ==========================================
    */

    experiences: [experienceSchema],

    /*
    ==========================================
    PROJECTS
    ==========================================
    */

    projects: [projectSchema],

    /*
    ==========================================
    RESUME PDF
    ==========================================
    */

    resumePdf: {
      url: String,

      publicId: String,
    },

    /*
    ==========================================
    SOCIAL LINKS
    ==========================================
    */

    socialLinks: {
      linkedin: String,

      github: String,

      portfolio: String,
    },

    /*
    ==========================================
    STATUS
    ==========================================
    */

    internshipStatus: {
      type: String,

      enum: [
        "Not Started",
        "Running",
        "Completed",
      ],

      default: "Not Started",
    },

    placementStatus: {
      type: String,

      enum: [
        "Not Placed",
        "Placed",
      ],

      default: "Not Placed",
    },

    /*
    ==========================================
    ACCOUNT STATUS
    ==========================================
    */

    role: {
      type: String,

      enum: [
        "student",
        "admin",
        "recruiter",
      ],

      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
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
  "Applicant",
  applicantSchema
);