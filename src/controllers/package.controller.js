import { uploadMultipleImageBuffersToCloudinary } from "../configs/streamupload.js";
import { Package } from "../models/TourPackage.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";

export const create_package = asyncHandler(async (req, res, next) => {
  const {
    package_options,
    itinerary,
    package_meta_details,
    important_information,
    inclusions,
    exclusions,
        package_available_dates,
        not_suitable_for

  } = req.body;
  const payload = {};

  let uploadResults = await uploadMultipleImageBuffersToCloudinary(
    req.files.package_images,
    "package_images"
  );
  console.log("uploadresults", uploadResults);

  if (uploadResults != null) {
    payload.package_images = uploadResults;
  }

  if (package_options && package_options.length > 0) {
    payload.package_options =
      typeof package_options === "string"
        ? JSON.parse(package_options)
        : package_options;
  }

  if (package_available_dates && package_available_dates.length >0){
    payload.package_available_dates = typeof package_available_dates === "string" ? JSON.parse(package_available_dates) : package_available_dates
  }
   if (not_suitable_for && not_suitable_for.length >0){
    payload.not_suitable_for = typeof not_suitable_for === "string" ? JSON.parse(not_suitable_for) : not_suitable_for
   }
  if (itinerary && itinerary.length > 0) {
    payload.itinerary =
      typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
  }

  if (package_meta_details && package_meta_details.length > 0) {
    payload.package_meta_details =
      typeof package_meta_details === "string"
        ? JSON.parse(package_meta_details)
        : package_meta_details;
  }
  if (inclusions) {
    payload.inclusions =
      typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
  }

  if (exclusions) {
    payload.exclusions =
      typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
  }

 if (important_information) {
    payload.important_information =
        typeof important_information === "string"
            ? JSON.parse(important_information)
            : important_information;
}
  const data = await Package.create({
    ...req.body,
    ...payload,
  });

  console.log("the package is created", data);

  return res.status(201).json({
    message: "the package received is",
    data: data,
    success: true,
  });
});

//get all packages with pagination
export const get_all_packages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  const skip = (page - 1) * limit;

  const packages = await Package.find().skip(skip).limit(limit);

  const total = await Package.countDocuments();

  return res.status(200).json({
    success: true,
    message: "Packages fetched successfully",
    data: packages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

//delete package by id
export const delete_package = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const pkg = await Package.findById(id);

  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  await Package.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Package deleted successfully",
  });
});

//update package by id
export const update_package = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let pkg = await Package.findById(id);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  const {
    package_options,
    itinerary,
    package_meta_details,
    important_information,
    inclusions,
    exclusions,
    package_available_dates
  } = req.body;

  const payload = {};

  if (req.files && req.files.package_images) {
    let uploadResults = await uploadMultipleImageBuffersToCloudinary(
      req.files.package_images,
      "package_images"
    );
    if (uploadResults != null) {
      payload.package_images = uploadResults;
    }
  }

  if (package_options) {
    payload.package_options =
      typeof package_options === "string"
        ? JSON.parse(package_options)
        : package_options;
  }

  if (itinerary) {
    payload.itinerary =
      typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
  }

  if (package_meta_details) {
    payload.package_meta_details =
      typeof package_meta_details === "string"
        ? JSON.parse(package_meta_details)
        : package_meta_details;
  }

  if (inclusions) {
    payload.inclusions =
      typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
  }

  if (exclusions) {
    payload.exclusions =
      typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
  }

 if (important_information) {
    payload.important_information =
        typeof important_information === "string"
            ? JSON.parse(important_information)
            : important_information;
}

  pkg = await Package.findByIdAndUpdate(
    id,
    {
      ...req.body,
      ...payload,
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Package updated successfully",
    data: pkg,
  });
});

// get package by id
export const get_package_by_id = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

const pkg = await Package.findById(id)
  // .populate({
  //   path: "itinerary.activities", // path to populate
  //   model: "Activity" // the model to use
  // })
  // .exec();

  if (!pkg) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Package fetched successfully",
    data: pkg,
  });
});
