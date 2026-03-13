import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../configs/cloudinary.js";

import mongoose from "mongoose";
import slugify from "slugify";
import Activity from "../models/Admin/activity.model.js";
import Package from "../models/Admin/package.model.js";
import Place from "../models/Place.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import ApiError from "../utils/error/ApiError.js";
import successResponse from "../utils/error/successResponse.js";
import addonsModel from "../models/Admin/addons.model.js";
// // GET all activities (with optional filters)
// export const getAllActivities = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       isActive,
//       category,
//       categories,
//       location,
//       duration,
//     } = req.query;
//     const filter =
//       isActive !== undefined ? { isActive: isActive === "true" } : {};

//     if (categories) {
//       const categoryArray = Array.isArray(categories)
//         ? categories
//         : categories.split(",");

//       filter.category = { $in: categoryArray };
//     } else if (category) {
//       filter.category = category;
//     }

//     if (location) {
//       filter.location = location;
//     }

//     if (duration) {
//       if (duration === "0-1") {
//         filter["duration.hours"] = { $lte: 1 };
//       }

//       if (duration === "1-4") {
//         filter["duration.hours"] = { $gte: 1, $lte: 4 };
//       }

//       if (duration === "4-24") {
//         filter["duration.hours"] = { $gte: 4, $lte: 24 };
//       }

//       if (duration === "24+") {
//         filter["duration.hours"] = { $gt: 24 };
//       }
//     }

//     const activities = await Activity.find(filter)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await Activity.countDocuments(filter);

//     res.json({
//       activities,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET populaer acitivies
// export const getPopularActivities = async (req, res) => {
//   try {
//     const limit = Number(req.query.limit) || 10;

//     const activities = await Activity.aggregate([
//       {
//         $match: {
//           isActive: true,
//           reviewCount: { $gt: 0 },
//         },
//       },
//       {
//         $addFields: {
//           popularityScore: {
//             $add: [
//               { $multiply: ["$rating", 0.7] },
//               {
//                 $multiply: [{ $ln: { $add: ["$reviewCount", 1] } }, 0.3],
//               },
//             ],
//           },
//         },
//       },
//       { $sort: { popularityScore: -1 } },
//       { $limit: limit },
//       {
//         $project: {
//           title: 1,
//           shortDescription: 1,
//           category: 1,
//           location: 1,
//           images: 1,
//           rating: 1,
//           reviewCount: 1,
//           popularityScore: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       activities,
//     });
//   } catch (error) {
//     console.error("Popular Activities Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch popular activities",
//     });
//   }
// };

// // Get popular locations
// export const getPopularLocations = async (req, res) => {
//   try {
//     const limit = Number(req.query.limit) || 10;

//     const locations = await Activity.aggregate([
//       {
//         $match: {
//           isActive: true,
//           location: { $exists: true, $ne: "" },
//           reviewCount: { $gt: 0 },
//         },
//       },

//       // Group activities by location
//       {
//         $group: {
//           _id: "$location",

//           totalActivities: { $sum: 1 },
//           totalReviews: { $sum: "$reviewCount" },
//           avgRating: { $avg: "$rating" },

//           // Pick one main image from activities
//           image: {
//             $first: {
//               $arrayElemAt: [
//                 {
//                   $filter: {
//                     input: "$images",
//                     as: "img",
//                     cond: { $eq: ["$$img.isMain", true] },
//                   },
//                 },
//                 0,
//               ],
//             },
//           },
//         },
//       },

//       // Calculate popularity score
//       {
//         $addFields: {
//           popularityScore: {
//             $add: [
//               { $multiply: ["$avgRating", 0.7] },
//               {
//                 $multiply: [{ $ln: { $add: ["$totalReviews", 1] } }, 0.3],
//               },
//             ],
//           },
//         },
//       },

//       // Sort by popularity
//       { $sort: { popularityScore: -1 } },

//       // Limit results
//       { $limit: limit },

//       // Final shape
//       {
//         $project: {
//           _id: 0,
//           location: "$_id",
//           totalActivities: 1,
//           totalReviews: 1,
//           avgRating: { $round: ["$avgRating", 1] },
//           popularityScore: { $round: ["$popularityScore", 2] },
//           image: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       locations,
//     });
//   } catch (error) {
//     console.error("Popular Locations Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch popular locations",
//     });
//   }
// };

// // GET single activity by ID
// export const getActivityById = async (req, res) => {
//   try {
//     const activity = await Activity.findById(req.params.id);
//     if (!activity)
//       return res.status(404).json({ message: "Activity not found" });
//     res.json(activity);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // GET activities by category
// export const getActivitiesByCategory = async (req, res) => {
//   try {
//     const activities = await Activity.find({ category: req.params.category });
//     if (activities.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No activities found in this category" });
//     }
//     res.json(activities);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // CREATE new activity
// export const createActivity = async (req, res) => {
//   try {
//     console.log("req video file:", req.files?.video);
//     console.log("req image files:", req.files?.images);

//     /* ---------------- PARSE BODY ---------------- */
//     const data = {
//       title: req.body.title,
//       shortDescription: req.body.shortDescription,
//       fullDescription: req.body.fullDescription,
//       category: req.body.category,
//       location: req.body.location,
//       tags: parseJSON(req.body.tags, []),
//       duration: parseJSON(req.body.duration, {}),
//       languages: parseJSON(req.body.languages, []),
//       liveGuide: req.body.liveGuide === "true",

//       cancellationPolicy: parseJSON(req.body.cancellationPolicy, {}),
//       reservePolicy: parseJSON(req.body.reservePolicy, {}),
//       pickup: parseJSON(req.body.pickup, {}),

//       variants: parseJSON(req.body.variants, []),
//       availableDates: parseJSON(req.body.availableDates, []),
//       timeSlots: parseJSON(req.body.timeSlots, []),
//       itinerary: parseJSON(req.body.itinerary, []),
//       highlights: parseJSON(req.body.highlights, []),
//       includes: parseJSON(req.body.includes, []),
//       excludes: parseJSON(req.body.excludes, []),
//       addons: parseJSON(req.body.addons, []),
//       notSuitableFor: parseJSON(req.body.notSuitableFor, []),
//       importantInfo: parseJSON(req.body.importantInfo, []),

//       isActive: req.body.isActive === "true",
//     };

//     /* ---------------- UPLOAD IMAGES ---------------- */
//     if (req.files?.images?.length) {
//       const uploadedImages = await uploadFileToCloudinary(
//         req.files.images,
//         "activities/images"
//       );

//       data.images = uploadedImages.map((img, index) => ({
//         url: img.url,
//         public_id: img.public_id,
//         isMain: index === 0,
//       }));
//     }

//     /* ---------------- UPLOAD VIDEO ---------------- */
//     if (req.files?.video?.length) {
//       const [video] = await uploadFileToCloudinary(
//         req.files.video,
//         "activities/videos"
//       );

//       data.video = {
//         url: video.url,
//         public_id: video.public_id,
//       };
//     }

//     /* ---------------- SAVE ---------------- */
//     const activity = await Activity.create(data);

//     return res.status(201).json({
//       success: true,
//       message: "Activity created successfully",
//       data: activity,
//     });
//   } catch (error) {
//     console.error("Create Activity Error:", error);
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE activity (full replace or partial)
// export const updateActivity = async (req, res) => {
//   try {
//     const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!activity)
//       return res.status(404).json({ message: "Activity not found" });
//     res.json(activity);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // DELETE activity
// export const deleteActivity = async (req, res) => {
//   try {
//     const activity = await Activity.findByIdAndDelete(req.params.id);
//     if (!activity)
//       return res.status(404).json({ message: "Activity not found" });
//     res.json({ message: "Activity deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Toggle active status (soft enable/disable)
// export const toggleActive = async (req, res) => {
//   try {
//     const activity = await Activity.findById(req.params.id);
//     if (!activity)
//       return res.status(404).json({ message: "Activity not found" });

//     activity.isActive = !activity.isActive;
//     await activity.save();

//     res.json(activity);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createActivity = asyncHandler(async (req, res, next) => {
  const {
    name,
    categoryId,
    placeId,
    Experience,
    Itinerary,
    InfoAndLogistics,
    BBQ_BUFFET,
    PrivateSUV,
    timeSlots
  } = req.body;

  /* ---------- PARSE JSON SAFELY ---------- */

  let activityData;

  try {
    activityData = {
      name,
      categoryId,
      placeId,
      Experience: Experience ? JSON.parse(Experience) : {},
      Itinerary: Itinerary ? JSON.parse(Itinerary) : [],
      InfoAndLogistics: InfoAndLogistics ? JSON.parse(InfoAndLogistics) : {},
      BBQ_BUFFET: BBQ_BUFFET ? JSON.parse(BBQ_BUFFET) : null,
      PrivateSUV: PrivateSUV ? JSON.parse(PrivateSUV) : null,
      timeSlots: timeSlots? JSON.parse(timeSlots):null,
    };
  } catch (error) {
    return next(new ApiError("Invalid JSON format in request body", 400));
  }

  /* ---------- UPLOAD IMAGES ---------- */

  let Images = [];
  let Video = {};

  if (req.files?.images?.length) {
    const uploaded = await uploadFileToCloudinary(
      req.files.images,
      "activities/images"
    );

    Images = uploaded.map((img) => ({
      secure_url: img.url,
      public_id: img.public_id,
    }));
  }
  activityData.Images = Images;

  if (req.files?.video) {
    const uploaded = await uploadFileToCloudinary(
      req.files.video,
      "activities/video"
    );

    Video = {
      secure_url: uploaded[0].url,
      public_id: uploaded[0].public_id,
    };
  }
  activityData.Video = Video;

  /* ---------- SLUG ---------- */

  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Activity.findOne({ slug });

  if (exists) {
    return next(new ApiError("Activity already exists with this name", 400));
  }

  activityData.slug = slug;

  /* ---------- CREATE ACTIVITY ---------- */

  const activity = await Activity.create(activityData);

  /* ---------- SUCCESS RESPONSE ---------- */

  return successResponse(res, 201, "Activity created successfully", activity);
});

export const updateActivity = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError("activity id required", 400));
  }
  /* ---------- VALIDATE OBJECT ID ---------- */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("INVALID API ID", 400));
  }

  /* ---------- FIND ACTIVITY ---------- */
  const activity = await Activity.findById(id);

  if (!activity) {
    return next(new ApiError("Activity not found", 404));
  }

  /* ---------- UPDATE BASIC FIELDS ---------- */
  if (req.body.name) {
    activity.name = req.body.name;
    activity.slug = slugify(req.body.name, {
      lower: true,
      strict: true,
    });
  }

  if (req.body.categoryId) {
    activity.categoryId = req.body.categoryId;
  }
  if (req.body.placeId) {
    activity.placeId = req.body.placeId;
  }

  /* ---------- PARSE JSON FIELDS ---------- */
  const parseField = (field) =>
    req.body[field] ? JSON.parse(req.body[field]) : null;

  if (req.body.Experience) activity.Experience = parseField("Experience");
  if (req.body.Itinerary) activity.Itinerary = parseField("Itinerary");
  if (req.body.InfoAndLogistics)
    activity.InfoAndLogistics = parseField("InfoAndLogistics");
  if (req.body.BBQ_BUFFET) activity.BBQ_BUFFET = parseField("BBQ_BUFFET");
  if (req.body.PrivateSUV) activity.PrivateSUV = parseField("PrivateSUV");
  if(req.body.timeSlots) activity.timeSlots =parseField("timeSlots");
  /* ======================================================
      REMOVE IMAGES
  ====================================================== */

  if (req.body.removeImages) {
    const removeImages = JSON.parse(req.body.removeImages);
    // Delete from Cloudinary
    await deleteFileFromCloudinary(removeImages);

    // Remove from DB array
    const publicIdsToRemove = removeImages.map((img) => img.public_id);
    activity.Images = activity.Images.filter((item) => {
      !publicIdsToRemove.includes(item.public_id);
    });
  }

  /* ======================================================
      REMOVE VIDEO
  ====================================================== */

  if (req.body.removeVideo) {
    const removeVideo = JSON.parse(req.body.removeVideo);

    await deleteFileFromCloudinary(removeVideo);

    activity.Video = null;
  }

  /* ======================================================
      UPLOAD NEW IMAGES
  ====================================================== */

  if (req.files?.images?.length) {
    const uploadedImages = await uploadFileToCloudinary(
      req.files.images,
      "activities/images"
    );

    const newImages = uploadedImages.map((img) => ({
      secure_url: img.url,
      public_id: img.public_id,
    }));

    activity.Images.push(...newImages);
  }

  /* ======================================================
      UPLOAD NEW VIDEO
  ====================================================== */

  if (req.files?.video?.length) {
    // Remove old video if exists
    if (activity.Video?.publicId) {
      await deleteFileFromCloudinary(activity.Video.publicId);
    }

    const uploadedVideo = await uploadFileToCloudinary(
      req.files.video,
      "activities/videos"
    );

    activity.Video = {
      secure_url: uploadedVideo[0].url,
      public_id: uploadedVideo[0].public_id,
    };
  }

  /* ---------- SAVE UPDATED ACTIVITY ---------- */
  await activity.save();

  return successResponse(res, 200, "Activity updated successfully", activity);
});

export const toggleActivityStatusById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError("activity id required", 400));
  }
  /* ---------- VALIDATE OBJECT ID ---------- */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("INVALID API ID", 400));
  }

  // Use an aggregation pipeline with $set and $not to toggle the current value
  const activity = await Activity.findByIdAndUpdate(
    id,
    [{ $set: { isActive: { $not: "$isActive" } } }], // Pipeline syntax
    { new: true }
  );

  if (!activity) {
    return next(new ApiError("activity not found", 404));
  }

  return successResponse(
    res,
    200,
    `activity status changed successfully ,${activity.isActive}`,
    activity
  );
});

export const getActivityById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError("activity id required", 400));
  }
  /* ---------- VALIDATE OBJECT ID ---------- */
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("INVALID API ID", 400));
  }

  /* ---------- FIND ACTIVITY + VIRTUAL PACKAGES ---------- */
  const activity = await Activity.findById(id).populate({
    path: "packages",
    options: { sort: { price: 1 } },
  });

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  return successResponse(res, 200, "Activity found ", activity);
});

export const getAllActivity = asyncHandler(async (req, res, next) => {
  let { page = 1, limit = 10, category, place, search } = req.query;

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  /* ======================================================
     BUILD FILTER QUERY
  ====================================================== */
  const filter = {
    isActive: true,
  };

  /* ---------- SEARCH BY ACTIVITY NAME ---------- */
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  /* ======================================================
     CATEGORY FILTER (by category name)
  ====================================================== */
  if (category) {
    const categoryDoc = await Category.findOne({
      name: { $regex: `^${category}$`, $options: "i" },
    }).select("_id");

    if (!categoryDoc) {
      return successResponse(res, 200, "No activities found", {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
        },
      });
    }

    filter.categoryId = categoryDoc._id;
  }

  /* ======================================================
     PLACE FILTER (by region)
  ====================================================== */
  if (place) {
    const places = await Place.find({
      region: { $regex: place, $options: "i" },
    }).select("_id");

    if (!places.length) {
      return successResponse(res, 200, "No activities found", {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
        },
      });
    }

    filter.placeId = { $in: places.map((p) => p._id) };
  }

  /* ======================================================
     QUERY ACTIVITIES
  ====================================================== */
  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .select("-reviews") // optional: hide heavy fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Activity.countDocuments(filter),
  ]);

  /* ======================================================
     RESPONSE
  ====================================================== */
  return successResponse(res, 200, "Activities fetched successfully", {
    data: activities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/* ======================================================
   PACKAGE CONTROLLERS
====================================================== */

export const createPackage = asyncHandler(async (req, res, next) => {
  const {
    activityId,
    name,
    price,
    description,
    whatInclude,
    whatExclude,
    bookingFields,
    addons
  } = req.body;

  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new ApiError("Activity not found", 400));
  }
  if (addons && addons.length) {
    const uniqueAddons = new Set(addons);

    if (uniqueAddons.size !== addons.length) {
      return next(new ApiError("Duplicate addon ids are not allowed", 400));
    }

    const addonCount = await addonsModel.countDocuments({
      _id: { $in: addons },
    });

    if (addonCount !== addons.length) {
      return next(new ApiError("One or more addons are invalid", 400));
    }
  }

  const pkg = await Package.create({
    activityId,
    name,
    description,
    price,
    whatInclude,
    whatExclude,
    bookingFields: bookingFields || [],
    addons: addons || [],
  });

  return successResponse(res, 200, "Package created successfully", pkg);
});

export const updatePackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const {
    name,
    price,
    description,
    whatInclude,
    whatExclude,
    isActive,
    bookingFields,
    addons
  } = req.body;

  const pkg = await Package.findById(id);
  if (!pkg) {
    return next(new ApiError("Package not found", 404));
  }

  if (name !== undefined) pkg.name = name;
  if (price !== undefined) pkg.price = price;
  if (description !== undefined) pkg.description = description;
  if (whatInclude !== undefined) pkg.whatInclude = whatInclude;
  if (whatExclude !== undefined) pkg.whatExclude = whatExclude;
  if (isActive !== undefined) pkg.isActive = isActive;

  if (bookingFields !== undefined) {
    pkg.bookingFields = bookingFields;
  }
   if (addons!==undefined && addons.length) {
     const uniqueAddons = new Set(addons);

     if (uniqueAddons.size !== addons.length) {
       return next(new ApiError("Duplicate addon ids are not allowed", 400));
     }

     const addonCount = await addonsModel.countDocuments({
       _id: { $in: addons },
     });

     if (addonCount !== addons.length) {
       return next(new ApiError("One or more addons are invalid", 400));
     }
       pkg.addons = addons;
   }
   

  await pkg.save();

  return successResponse(res, 200, "Package updated successfully", pkg);
});