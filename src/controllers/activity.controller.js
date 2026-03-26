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
  // const parseField = (field) =>
  //   req.body[field] ? JSON.parse(req.body[field]) : null;
//   const parseField = (field) => {
//   try {
//     return req.body[field] ? JSON.parse(req.body[field]) : null;
//   } catch (err) {
//     throw new ApiError(`${field} must be valid JSON`, 400);
//   }
// };

const parseField = (field) => {
  try {
    const value = req.body[field];

    // if (!value) return null;
    if (value === undefined) return undefined;

    // ✅ already object hai → return directly
    if (typeof value === "object") return value;

    // ✅ string hai → parse karo
    return JSON.parse(value);

  } catch (err) {
    throw new ApiError(`${field} must be valid JSON`, 400);
  }
};

const experience = parseField("Experience");
const itinerary = parseField("Itinerary");
const logistics = parseField("InfoAndLogistics");
const bbq = parseField("BBQ_BUFFET");
const suv = parseField("PrivateSUV");
const timeSlots = parseField("timeSlots");

if (experience !== undefined) activity.Experience = experience;
if (itinerary !== undefined) activity.Itinerary = itinerary;
if (logistics !== undefined) activity.InfoAndLogistics = logistics;
if (bbq !== undefined) activity.BBQ_BUFFET = bbq;
if (suv !== undefined) activity.PrivateSUV = suv;
if (timeSlots !== undefined) activity.timeSlots = timeSlots;
  /* ======================================================
      REMOVE IMAGES
  ====================================================== */

  if (req.body.removeImages) {
    const removeImages = JSON.parse(req.body.removeImages);
    // Delete from Cloudinary
    // await deleteFileFromCloudinary(removeImages);
    if (removeImages.length) {
  await deleteFileFromCloudinary(removeImages);
}

    // Remove from DB array
    const publicIdsToRemove = removeImages.map((img) => img.public_id);
    // activity.Images = activity.Images.filter((item) => {
    //   !publicIdsToRemove.includes(item.public_id);
    // });
    activity.Images = activity.Images.filter(
  (item) => !publicIdsToRemove.includes(item.public_id)
);
  }

  /* ======================================================
      REMOVE VIDEO
  ====================================================== */

  if (req.body.removeVideo) {
  if (activity.Video?.public_id) {
    await deleteFileFromCloudinary(activity.Video.public_id);
  }
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
    // if (activity.Video?.publicId) {
    //   await deleteFileFromCloudinary(activity.Video.publicId);
    // }
    if (activity.Video?.public_id) {
  await deleteFileFromCloudinary(activity.Video.public_id);
}
activity.Video = null;
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

export const createPackage = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const {
      activityId,
      name,
      description,
      price,
      whatInclude = [],
      whatExclude = [],
      bookingFields = [],
      // addons = [],
      isActive = true,
    } = req.body;
    const addons = [
  "65f1a2b3c4d5e6f7890a1111",
  "65f1a2b3c4d5e6f7890a2222"
];

    if (!activityId || !name || price === undefined) {
      throw new ApiError("activityId, name and price are required", 400);
    }

    const activityExists = await Activity.exists({ _id: activityId }).session(session);

    if (!activityExists) {
      throw new ApiError("Activity not found", 404);
    }


    // if (addons.length) {

    //   const uniqueAddons = [...new Set(addons)];

    //   if (uniqueAddons.length !== addons.length) {
    //     throw new ApiError("Duplicate addon ids are not allowed", 400);
    //   }

    //   const addonCount = await addonsModel
    //     .countDocuments({ _id: { $in: uniqueAddons } })
    //     .session(session);

    //   if (addonCount !== uniqueAddons.length) {
    //     throw new ApiError("Invalid addon ids", 400);
    //   }
    // }


    const sanitizedBookingFields = bookingFields.map(field => {

      if (!field.name) {
        throw new ApiError("Booking field name required", 400);
      }

      // return {
      //   name: field.name.trim(),
      //   unit: field.unit || "quantity",
      //   min: Math.max(Number(field.min) || 0, 0),
      //   max: Math.max(Number(field.max) || 0, 0),
      //   price: Math.max(Number(field.price) || 0, 0)
      // };
      return {
  name: field.name.trim(),
  unit: field.unit || "quantity",

  seat: field.unit === "quantity"
    ? Math.max(Number(field.seat) || 0, 0)
    : undefined,

  duration: field.unit === "minute"
    ? Math.max(Number(field.duration) || 0, 0)
    : undefined,

  min: Math.max(Number(field.min) || 0, 0),
  max: Math.max(Number(field.max) || 0, 0),
  price: Math.max(Number(field.price) || 0, 0)
};

    });


    const [pkg] = await Package.create(
      [{
        activityId,
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        whatInclude,
        whatExclude,
        bookingFields: sanitizedBookingFields,
        addons,
        isActive
      }],
      { session }
    );

    /* UPDATE PACKAGE COUNT */

    await Activity.updateOne(
      { _id: activityId },
      { $inc: { packageCount: 1 } },
      { session }
    );

    await session.commitTransaction();

    return successResponse(res, 201, "Package created successfully", pkg);

  } catch (error) {

    await session.abortTransaction();
    return next(error);

  } finally {

    session.endSession();

  }

});

// export const getAllActivity = asyncHandler(async (req, res, next) => {
//   let { page = 1, limit = 10, category, place, search } = req.query;

//   page = Number(page);
//   limit = Number(limit);
//   const skip = (page - 1) * limit;

//   /* ======================================================
//      BUILD FILTER QUERY
//   ====================================================== */
//   const filter = {
//     isActive: true,
//   };

//   /* ---------- SEARCH BY ACTIVITY NAME ---------- */
//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }

//   /* ======================================================
//      CATEGORY FILTER (by category name)
//   ====================================================== */
//   if (category) {
//     const categoryDoc = await Category.findOne({
//       name: { $regex: `^${category}$`, $options: "i" },
//     }).select("_id");

//     if (!categoryDoc) {
//       return successResponse(res, 200, "No activities found", {
//         data: [],
//         pagination: {
//           total: 0,
//           page,
//           limit,
//         },
//       });
//     }

//     filter.categoryId = categoryDoc._id;
//   }

//   /* ======================================================
//      PLACE FILTER (by region)
//   ====================================================== */
//   if (place) {
//     const places = await Place.find({
//       region: { $regex: place, $options: "i" },
//     }).select("_id");

//     if (!places.length) {
//       return successResponse(res, 200, "No activities found", {
//         data: [],
//         pagination: {
//           total: 0,
//           page,
//           limit,
//         },
//       });
//     }

//     filter.placeId = { $in: places.map((p) => p._id) };
//   }

//   /* ======================================================
//      QUERY ACTIVITIES
//   ====================================================== */
//   const [activities, total] = await Promise.all([
//     Activity.find(filter)
//       .populate('placeId','name region')
//       .select("-reviews") // optional: hide heavy fields
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean(),

//     Activity.countDocuments(filter),
//   ]);

//   /* ======================================================
//      RESPONSE
//   ====================================================== */
//   return successResponse(res, 200, "Activities fetched successfully", {
//     data: activities,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   });
// });



// export const getAllActivity = asyncHandler(async (req, res, next) => {
//   let { page = 1, limit = 10, categoryId, place, search } = req.query;

//   page = Number(page);
//   limit = Number(limit);
//   const skip = (page - 1) * limit;

//   const filter = {
//   isActive: true,
// };

// /* SEARCH */
// if (search) {
//   filter.name = { $regex: search, $options: "i" };
// }

// /* CATEGORY */
// if (categoryId) {
//   filter.categoryId = categoryId;
// }

// /* LOCATION (ID BASED 🔥) */
// if (place) {
//   filter.placeId = place;
// }

//   /* ======================================================
//      PLACE FILTER (by region)
//   ====================================================== */
//   // if (place) {
//   //   const places = await Place.find({
//   //     region: { $regex: place, $options: "i" },
//   //   }).select("_id");

//   //   if (!places.length) {
//   //     return successResponse(res, 200, "No activities found", {
//   //       data: [],
//   //       pagination: {
//   //         total: 0,
//   //         page,
//   //         limit,
//   //       },
//   //     });
//   //   }

//   //   filter.placeId = { $in: places.map((p) => p._id) };
//   // }
//   const [activities, total] = await Promise.all([
//     Activity.find(filter)
//       // .populate("placeId", "name region")
//         .populate("placeId", "name region")
//     .populate("categoryId", "name image description")
//       .select("-reviews")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean(),

//     Activity.countDocuments(filter),
//   ]);
//   return successResponse(res, 200, "Activities fetched successfully", {
//     data: activities,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   });
// });


export const getAllActivity = asyncHandler(async (req, res, next) => {
  let { 
    page = 1, 
    limit = 10, 
    categoryId, 
    place, 
    search,
    slug // ✅ NEW
  } = req.query;

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  const filter = {
    isActive: true,
  };

  /* ================= SLUG (🔥 MAIN LOGIC) ================= */
  if (slug) {
    filter.slug = slug;
  }

  /* SEARCH */
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  /* CATEGORY */
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  /* LOCATION */
  if (place) {
    filter.placeId = place;
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate("placeId", "name region")
      .populate("categoryId", "name image description")
      .populate({
        path: "packages",
        options: { sort: { price: 1 } }, // ✅ same detail jese getById
      })
      .select("-reviews")
      .lean(),

    Activity.countDocuments(filter),
  ]);

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

export const getAllPackages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const packages = await Package.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return successResponse(res, 200, "Packages fetched successfully", packages);
});
export const getPackagesByActivity = asyncHandler(async (req, res, next) => {
  const { activityId } = req.params;

  const packages = await Package.find({
    activityId,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return successResponse(res, 200, "Packages fetched successfully", packages);
});

export const getPackageById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const pkg = await Package.findById(id).lean();

  if (!pkg) {
    return next(new ApiError("Package not found", 404));
  }

  return successResponse(res, 200, "Package fetched successfully", pkg);
});



//top rated activities
export const getTopSellingTours = asyncHandler(async (req, res, next) => {
  const activities = await Activity.aggregate([
    // 1. Only get active activities
    { $match: { isActive: true } },

    /* ---------- CALCULATE RATINGS ---------- */
    {
      $lookup: {
        from: "reviews", // Check your DB, might be "review_maliks" if using your custom naming
        localField: "_id", // Activity ID
        foreignField: "activity", // The field name in your Review image
        as: "reviewDetails",
      },
    },
    {
      $addFields: {
        averageRating: { $ifNull: [{ $avg: "$reviewDetails.rating" }, 0] },
        totalReviews: { $size: "$reviewDetails" },
      },
    },

    /* ---------- GET MINIMUM PRICE FROM PACKAGES ---------- */
    {
      $lookup: {
        from: "packages", 
        localField: "_id",
        foreignField: "activityId",
        as: "packages",
      },
    },
    {
      $addFields: {
        startingPrice: { $min: "$packages.price" },
      },
    },

    /* ---------- GET PLACE INFO ---------- */
    {
      $lookup: {
        from: "places", 
        localField: "placeId",
        foreignField: "_id",
        as: "place",
      },
    },
    { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },

    /* ---------- GET CATEGORY INFO ---------- */
    {
      $lookup: {
        from: "categories", 
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

    /* ---------- SORT BY RATING ---------- */
    { $sort: { averageRating: -1, totalReviews: -1 } },

    /* ---------- LIMIT ---------- */
    { $limit: 10 },

    /* ---------- FINAL OBJECT MAPPING ---------- */
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        // Get first image from array
        image: { $arrayElemAt: ["$Images.secure_url", 0] }, 
        rating: { $round: ["$averageRating", 1] },
        reviewCount: "$totalReviews",
        location: { $ifNull: ["$place.name", "N/A"] },
        categoryName: { $ifNull: ["$category.name", "N/A"] },
        startingPrice: { $ifNull: ["$startingPrice", 0] },
      },
    },
  ]);

  return successResponse(res, 200, "Top selling tours fetched", activities);
});