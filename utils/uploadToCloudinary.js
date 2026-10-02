const cloudinary = require(
  "../config/cloudinary"
);

const uploadToCloudinary =
  async (
    file,
    folder,
    resourceType = "auto"
  ) => {
    try {
      /*
      ==========================================
      CONVERT BUFFER TO BASE64
      ==========================================
      */

      const fileBase64 = `data:${
        file.mimetype
      };base64,${file.buffer.toString(
        "base64"
      )}`;

      /*
      ==========================================
      UPLOAD TO CLOUDINARY
      ==========================================
      */

      const result =
        await cloudinary.uploader.upload(
          fileBase64,
          {
            folder,

            resource_type:
              resourceType,
          }
        );

      /*
      ==========================================
      RETURN RESPONSE
      ==========================================
      */

      return {
        success: true,

        url: result.secure_url,

        publicId:
          result.public_id,

        originalName:
          file.originalname,

        bytes: result.bytes,

        format: result.format,

        resourceType:
          result.resource_type,
      };
    } catch (error) {
      console.log(error);

      throw new Error(
        "Cloudinary Upload Failed"
      );
    }
  };

module.exports =
  uploadToCloudinary;