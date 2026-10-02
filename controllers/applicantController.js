const bcrypt = require("bcryptjs");


const Applicant = require(
  "../models/Applicant"
);

const cloudinary = require(
  "../config/cloudinary"
);

/*
==================================================
CREATE APPLICANT
==================================================
*/

const generateReferralCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 12; i++) {
    code += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );
  }

  return code;
};

/*
==================================================
GENERATE UNIQUE REFERRAL CODE
==================================================
*/

const generateUniqueReferralCode =
  async () => {
    let code;
    let exists = true;

    while (exists) {
      code = generateReferralCode();

      exists =
        await Applicant.findOne({
          referralCode: code,
        });
    }

    return code;
  };

/*
==================================================
CREATE APPLICANT
==================================================
*/

exports.createApplicant =
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        password,
        skills,
        referby,
      } = req.body;

      /*
      ==========================================
      CHECK EMAIL
      ==========================================
      */

      const existingApplicant =
        await Applicant.findOne({
          email,
        });

      if (existingApplicant) {
        return res.status(400).json({
          success: false,
          message:
            "Email already exists",
        });
      }

      
      const hashedPassword =
  await bcrypt.hash(
    password,
    10
  );

    
      const referralCode =
        await generateUniqueReferralCode();

      /*
      ==========================================
      PROFILE IMAGE
      ==========================================
      */

      let profileImageData = {};

      if (
        req.files &&
        req.files.profileImage
      ) {
        const image =
          req.files.profileImage[0];

        const imageBase64 = `data:${
          image.mimetype
        };base64,${image.buffer.toString(
          "base64"
        )}`;

        const imageUpload =
          await cloudinary.uploader.upload(
            imageBase64,
            {
              folder:
                "lms/profile_images",
              resource_type:
                "image",
            }
          );

        profileImageData = {
          url:
            imageUpload.secure_url,

          publicId:
            imageUpload.public_id,
        };
      }

      

      let resumePdfData = {};

      if (
        req.files &&
        req.files.resumePdf
      ) {
        const pdf =
          req.files.resumePdf[0];

        const pdfBase64 = `data:application/pdf;base64,${pdf.buffer.toString(
          "base64"
        )}`;

        const pdfUpload =
          await cloudinary.uploader.upload(
            pdfBase64,
            {
              folder:
                "lms/resume_pdfs",

              resource_type:
                "raw",
            }
          );

        resumePdfData = {
          url:
            pdfUpload.secure_url,

          publicId:
            pdfUpload.public_id,
        };
      }


      const applicant =
        await Applicant.create({
          fullName,
          email,
          phone,
          password: hashedPassword,
          referby:req.body.referby || null,
            
          referralCode,

          skills:
            skills?.split(",") ||
            [],

          profileImage:
            profileImageData,

          resumePdf:
            resumePdfData,
        });

      

      res.status(201).json({
        success: true,

        message:
          "Applicant Created Successfully",

        referralCode:
          applicant.referralCode,

        referralLink:
          `http://localhost:3000/apply?ref=${applicant.referralCode}`,

        applicant,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };


exports.getAllApplicants =
  async (req, res) => {
    try {
      const applicants =
        await Applicant.find().sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        total:
          applicants.length,
        applicants,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:"Internal Server Error",
        error: error.message,
      });
    }
  };



exports.getSingleApplicant =
  async (req, res) => {
    try {
      const applicant =
        await Applicant.findById(
          req.params.id
        );

      if (!applicant) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant Not Found",
        });
      }

      res.status(200).json({
        success: true,
        applicant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };


  exports.loginApplicant =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      const applicant =
        await Applicant.findOne({
          email:
            email.toLowerCase(),
        });

      if (!applicant) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant not found",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          applicant.password
        );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Login successful",

        applicantId:
          applicant._id,

            
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error",
        error:
          error.message,
      });
    }
  };
