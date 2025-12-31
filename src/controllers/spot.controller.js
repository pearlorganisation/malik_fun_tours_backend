import Spot from "../models/Spot.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../configs/cloudinary.js";

/* ================= CREATE SPOT ================= */
export const createSpot = async (req, res) => {

  try {
    const {
      title,
      category,
      location,
      overview,
      avgRating,
      totalReviews,
      thingsToDo,
      howToGetThere,
      visitorInfo,
      whereToStay,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const [image] = await uploadFileToCloudinary(req.file, "spots");

    const spot = await Spot.create({
      title,
      category,
      location,
      overview,
      avgRating,
      totalReviews,
      image: image.url,
      thingsToDo: thingsToDo ? JSON.parse(thingsToDo) : [],
      howToGetThere: howToGetThere ? JSON.parse(howToGetThere) : [],
      visitorInfo: visitorInfo ? JSON.parse(visitorInfo) : {},
      whereToStay: whereToStay ? JSON.parse(whereToStay) : [],
    });

    res.status(201).json({ success: true, data: spot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET ALL SPOTS ================= */
export const getAllSpots = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search; // 🔍 title search

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" }; // case-insensitive
    }

    // Fetch spots
    const spots = await Spot.find(filter)
      .populate("whereToStay")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count for pagination
    const total = await Spot.countDocuments(filter);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: spots.length,
      data: spots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/* ================= GET SINGLE SPOT ================= */
export const getSpotById = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id).populate("whereToStay");

    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    res.json({ success: true, data: spot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE SPOT ================= */
export const updateSpot = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    let imageUrl = spot.image;

    if (req.file) {
      const [image] = await uploadFileToCloudinary(req.file, "spots");
      imageUrl = image.url;
    }

    const updatedSpot = await Spot.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: imageUrl,
        thingsToDo: req.body.thingsToDo
          ? JSON.parse(req.body.thingsToDo)
          : spot.thingsToDo,
        howToGetThere: req.body.howToGetThere
          ? JSON.parse(req.body.howToGetThere)
          : spot.howToGetThere,
        visitorInfo: req.body.visitorInfo
          ? JSON.parse(req.body.visitorInfo)
          : spot.visitorInfo,
        whereToStay: req.body.whereToStay
          ? JSON.parse(req.body.whereToStay)
          : spot.whereToStay,
      },
      { new: true }
    );

    res.json({ success: true, data: updatedSpot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE SPOT ================= */
export const deleteSpot = async (req, res) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    // Extract public_id from image URL
    const publicId = spot.image.split("/").slice(-1)[0].split(".")[0];

    await deleteFileFromCloudinary({
      public_id: `fun_tours/spots/${publicId}`,
      resource_type: "image",
    });

    await spot.deleteOne();

    res.json({ success: true, message: "Spot deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
