import { body, param } from "express-validator";
import mongoose from "mongoose";

export const activityValidator = [
  /* ---------- BASIC FIELDS ---------- */
 
  body("name")
    .notEmpty()
    .withMessage("Activity name is required")
    .isLength({ min: 3 })
    .withMessage("Activity name must be at least 3 characters"),

  body("categoryId")
    .notEmpty()
    .withMessage("categoryId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid categoryId"),

  body("placeId")
    .notEmpty()
    .withMessage("placeId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid palceId"),

  /* ---------- EXPERIENCE ---------- */

  body("Experience")
    .notEmpty()
    .withMessage("Experience object is required")
    .custom((value) => {
      console.log("hlo",typeof value);
      const exp = JSON.parse(value);

      if (!exp.title) throw new Error("Experience.title is required");
      if (!exp.description)
        throw new Error("Experience.description is required");

      if (exp.highlights && !Array.isArray(exp.highlights))
        throw new Error("Experience.highlights must be an array");

      return true;
    }),

  /* ---------- ITINERARY ---------- */

  body("Itinerary")
    .optional()
    .custom((value) => {
      const itinerary = JSON.parse(value);

      if (!Array.isArray(itinerary))
        throw new Error("Itinerary must be an array");

      itinerary.forEach((item, index) => {
        if (!item.title || !item.description) {
          throw new Error(
            `Itinerary item ${index + 1} must have title and description`
          );
        }
      });

      return true;
    }),

  /* ---------- INFO & LOGISTICS ---------- */

  body("InfoAndLogistics")
    .optional()
    .custom((value) => {
      const info = JSON.parse(value);

      if (info.keyInfo && !Array.isArray(info.keyInfo))
        throw new Error("InfoAndLogistics.keyInfo must be an array");

      if (info.essentialGuide && !Array.isArray(info.essentialGuide))
        throw new Error("InfoAndLogistics.essentialGuide must be an array");

      return true;
    }),

  /* ---------- BBQ BUFFET ---------- */

  body("BBQ_BUFFET")
    .optional()
    .custom((value) => {
      const bbq = JSON.parse(value);

      if (bbq.fields && !Array.isArray(bbq.fields))
        throw new Error("BBQ_BUFFET.fields must be an array");

      bbq.fields?.forEach((field, index) => {
        if (!field.category)
          throw new Error(`BBQ field ${index + 1} category is required`);
      });

      return true;
    }),

  /* ---------- PRIVATE SUV ---------- */

  body("PrivateSUV")
    .optional()
    .custom((value) => {
      const suv = JSON.parse(value);

      if (suv.available !== undefined && typeof suv.available !== "boolean") {
        throw new Error("PrivateSUV.available must be boolean");
      }

      if (suv.fee && typeof suv.fee !== "number") {
        throw new Error("PrivateSUV.fee must be number");
      }

      return true;
    }),
];

export const updateActivityValidator = [
  /* ---------- PARAM ID ---------- */
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid activity ID"),

  /* ---------- OPTIONAL FIELDS ---------- */
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Activity name must be at least 3 characters"),

  body("categoryId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid categoryId"),
  body("placeId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid palceId"),

  /* ---------- JSON FIELDS ---------- */
  body("Experience")
    .optional()
    .custom((value) => {
      JSON.parse(value);
      return true;
    })
    .withMessage("Experience must be valid JSON"),

  body("Itinerary")
    .optional()
    .custom((value) => {
      const itinerary = JSON.parse(value);
      if (!Array.isArray(itinerary)) {
        throw new Error("Itinerary must be an array");
      }
      return true;
    }),

  body("InfoAndLogistics")
    .optional()
    .custom((value) => {
      JSON.parse(value);
      return true;
    }),

  body("BBQ_BUFFET")
    .optional()
    .custom((value) => {
      JSON.parse(value);
      return true;
    }),

  body("PrivateSUV")
    .optional()
    .custom((value) => {
      JSON.parse(value);
      return true;
    }),

  /* ---------- REMOVE IMAGES ---------- */
  body("removeImages")
    .optional()
    .custom((value) => {
      const images = JSON.parse(value);

      if (!Array.isArray(images)) {
        throw new Error("removeImages must be an array");
      }

      images.forEach((img) => {
        if (!img.public_id) {
          throw new Error("Each removeImages item must contain publicId");
        }
      });

      return true;
    }),

  /* ---------- REMOVE VIDEO ---------- */
  body("removeVideo")
    .optional()
    .custom((value) => {
      const video = JSON.parse(value);

      if (!video.public_id) {
        throw new Error("removeVideo must contain publicId");
      }

      return true;
    }),
];

export const createPackageValidator = [
  body("activityId")
    .notEmpty()
    .withMessage("activityId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid activityId"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Package name is required")
    .isLength({ min: 2 })
    .withMessage("Package name must be at least 2 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be greater than or equal to 0"),

  body("whatInclude")
    .optional()
    .isArray()
    .withMessage("whatInclude must be an array of strings"),

  body("whatExclude")
    .optional()
    .isArray()
    .withMessage("whatExclude must be an array of strings"),
];

export const updatePackageValidator = [
  /* ---------- packageId in params ---------- */
  param("id")
    .notEmpty()
    .withMessage("Package ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Package ID"),

  /* ---------- name (optional) ---------- */
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Package name must be at least 2 characters"),

  /* ---------- price (optional) ---------- */
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be greater than or equal to 0"),

  /* ---------- whatInclude ---------- */
  body("whatInclude")
    .optional()
    .isArray()
    .withMessage("whatInclude must be an array of strings"),

  /* ---------- whatExclude ---------- */
  body("whatExclude")
    .optional()
    .isArray()
    .withMessage("whatExclude must be an array of strings"),
];
