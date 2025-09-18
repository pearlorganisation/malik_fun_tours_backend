import { uploadMultipleImageBuffersToCloudinary } from "../configs/streamupload.js";
import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";


//Create activity api
export const create_activity = asyncHandler(async (req, res, next) => {
  const {
    activity_options,
    activity_meta_details,
    activity_location,
    important_information,
    not_suitable_for,
  } = req.body;

  const payload = {};

  // Upload images if provided
  let uploadResults = await uploadMultipleImageBuffersToCloudinary(
    req.files.activity_images,
    "activity_images"
  );

  if (uploadResults != null) {
    payload.activity_images = uploadResults;
  }

  // Parse stringified JSON fields
  if (activity_options && activity_options.length > 0) {
    payload.activity_options =
      typeof activity_options === "string"
        ? JSON.parse(activity_options)
        : activity_options;
  }

  if (activity_meta_details && activity_meta_details.length > 0) {
    payload.activity_meta_details =
      typeof activity_meta_details === "string"
        ? JSON.parse(activity_meta_details)
        : activity_meta_details;
  }

  if (activity_location) {
    payload.activity_location =
      typeof activity_location === "string"
        ? JSON.parse(activity_location)
        : activity_location;
  }

  if (important_information) {
    payload.important_information =
      typeof important_information === "string"
        ? JSON.parse(important_information)
        : important_information;
  }

  if (not_suitable_for) {
    payload.not_suitable_for =
      typeof not_suitable_for === "string"
        ? JSON.parse(not_suitable_for)
        : not_suitable_for;
  }

  const data = await Activity.create({
    ...req.body,
    ...payload,
  });

  return res.status(201).json({
    success: true,
    message: "Activity created successfully",
    data,
  });
});


// GET ALL ACTIVITIES (with pagination)
export const get_all_activities = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;

  const activities = await Activity.find().skip(skip).limit(limit);
  const total = await Activity.countDocuments();

  return res.status(200).json({
    success: true,
    message: "Activities fetched successfully",
    data: activities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


// DELETE ACTIVITY BY ID
export const delete_activity = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const activity = await Activity.findById(id);
  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  await Activity.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Activity deleted successfully",
  });
});


// UPDATE ACTIVITY BY ID
export const update_activity = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let activity = await Activity.findById(id);
  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  const {
    activity_options,
    activity_meta_details,
    activity_location,
    important_information,
    not_suitable_for,
  } = req.body;

  const payload = {};

  // Handle new image uploads
  if (req.files && req.files.activity_images) {
    let uploadResults = await uploadMultipleImageBuffersToCloudinary(
      req.files.activity_images,
      "activity_images"
    );
    if (uploadResults != null) {
      payload.activity_images = uploadResults;
    }
  }

  // Parse JSON fields if needed
  if (activity_options) {
    payload.activity_options =
      typeof activity_options === "string"
        ? JSON.parse(activity_options)
        : activity_options;
  }

  if (activity_meta_details) {
    payload.activity_meta_details =
      typeof activity_meta_details === "string"
        ? JSON.parse(activity_meta_details)
        : activity_meta_details;
  }

  if (activity_location) {
    payload.activity_location =
      typeof activity_location === "string"
        ? JSON.parse(activity_location)
        : activity_location;
  }

  if (important_information) {
    payload.important_information =
      typeof important_information === "string"
        ? JSON.parse(important_information)
        : important_information;
  }

  if (not_suitable_for) {
    payload.not_suitable_for =
      typeof not_suitable_for === "string"
        ? JSON.parse(not_suitable_for)
        : not_suitable_for;
  }

  // Update activity
  activity = await Activity.findByIdAndUpdate(
    id,
    {
      ...req.body,
      ...payload,
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Activity updated successfully",
    data: activity,
  });
});


//get activity by id
// GET ACTIVITY BY ID
export const get_activity_by_id = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const activity = await Activity.findById(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Activity fetched successfully",
    data: activity,
  });
});
