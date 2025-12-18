import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

/* ---------------- CLOUDINARY CONFIG ---------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- UPLOAD (DISK STORAGE SAFE) ---------------- */
export const uploadFileToCloudinary = async (files, folderName = "default") => {
  try {
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadResults = await Promise.all(
      fileArray.map(async (file) => {
        if (!file?.path) {
          throw new Error("File path missing. Are you using diskStorage?");
        }

        const result = await cloudinary.uploader.upload(file.path, {
          folder: `fun_tours/${folderName}`,
          resource_type: file.mimetype.startsWith("video") ? "video" : "image",
        });

        // 🔥 ALWAYS remove temp file after upload
        fs.unlinkSync(file.path);

        return {
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        };
      })
    );

    return uploadResults;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/* ---------------- DELETE (IMAGE + VIDEO SAFE) ---------------- */
export const deleteFileFromCloudinary = async (files) => {
  try {
    const fileArray = Array.isArray(files) ? files : [files];

    const deleteResults = await Promise.all(
      fileArray.map(async (file) => {
        if (!file?.public_id) {
          return {
            success: false,
            error: "public_id missing",
          };
        }

        const result = await cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.resource_type || "image",
        });

        return {
          public_id: file.public_id,
          result,
        };
      })
    );

    const failed = deleteResults.filter((r) => r.result?.result !== "ok");

    if (failed.length) {
      return {
        success: false,
        message: "Some files failed to delete",
        failed,
      };
    }

    return {
      success: true,
      deleted: deleteResults,
    };
  } catch (error) {
    return {
      success: false,
      message: "Cloudinary deletion failed",
      error: error.message,
    };
  }
};

export default cloudinary;
