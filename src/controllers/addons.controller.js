import mongoose from "mongoose";
import Addon from "../models/addon.model.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import ApiError from "../utils/error/ApiError.js";
import successResponse from "../utils/error/successResponse.js";


export const createAddon = asyncHandler(async (req, res, next) => {
  const { name, price, max } = req.body;

  if (!name) {
    return next(new ApiError("Addon name is required", 400));
  }

  if (price === undefined) {
    return next(new ApiError("Addon price is required", 400));
  }

  if (price < 0) {
    return next(new ApiError("Price cannot be negative", 400));
  }

  if (max && max < 1) {
    return next(new ApiError("Max must be greater than 0", 400));
  }

  const exists = await Addon.findOne({
    name: name.toUpperCase(),
  });

  if (exists) {
    return next(new ApiError("Addon already exists", 400));
  }

  const addon = await Addon.create({
    name,
    price,
    max: max || 1,
  });

  return successResponse(res, 201, "Addon created successfully", addon);
});

export const updateAddon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError("Addon id is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid addon id", 400));
  }

  const addon = await Addon.findById(id);

  if (!addon) {
    return next(new ApiError("Addon not found", 404));
  }

  const { name, price, max } = req.body;

  if (name !== undefined) addon.name = name;

  if (price !== undefined) {
    if (price < 0) {
      return next(new ApiError("Price cannot be negative", 400));
    }
    addon.price = price;
  }

  if (max !== undefined) {
    if (max < 1) {
      return next(new ApiError("Max must be greater than 0", 400));
    }
    addon.max = max;
  }

  await addon.save();

  return successResponse(res, 200, "Addon updated successfully", addon);
});

export const getAllAddons = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, search } = req.query;

  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const [addons, total] = await Promise.all([
    Addon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Addon.countDocuments(filter),
  ]);

  return successResponse(res, 200, "Addons fetched successfully", {
    data: addons,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const deleteAddon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError("Addon id is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError("Invalid addon id", 400));
  }

  const addon = await Addon.findByIdAndDelete(id);

  if (!addon) {
    return next(new ApiError("Addon not found", 404));
  }

  return successResponse(res, 200, "Addon deleted successfully", addon);
});