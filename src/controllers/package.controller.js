import { uploadMultipleImageBuffersToCloudinary } from "../configs/streamupload.js";
import { Package } from "../models/TourPackage.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";

export const create_package = asyncHandler(async (req, res, next) => {
    const {
        package_options,
        itinerary,
        package_meta_details,
        inclusions,
        exclusions
    } = req.body;
    const payload = {};
    //console.log("req.body", req.body);
    console.log("inclusion", inclusions);
    console.log("explusion", exclusions);

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
            typeof package_options === "string" ?
            JSON.parse(package_options) :
            package_options;
    }

     if (itinerary && itinerary.length > 0) {
        payload.itinerary =
            typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
    }

     if (package_meta_details && package_meta_details.length > 0) {
        payload.package_meta_details =
            typeof package_meta_details === "string" ?
            JSON.parse(package_meta_details) :
            package_meta_details;
    }
  if (inclusions) {
    payload.inclusions =
      typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
  }

  if (exclusions) {
    payload.exclusions =
      typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
  }
    const data = await Package.create({
        ...req.body,
        ...payload
    });

    console.log("the package is created", data);

    return res
        .status(201)
        .json({
            message: "the package received is",
            data:data,
            success: true
        });
});

export const get_all_packages = asyncHandler(async(req, res, next)=>{

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


})