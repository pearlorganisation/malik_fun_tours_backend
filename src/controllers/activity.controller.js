import Activity from "../models/Activity.js";
import { uploadFileToCloudinary } from "../configs/cloudinary.js";
import { parseJSON } from "../utils/parseJson.js";


// GET all activities (with optional filters)
export const getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, category, location } = req.query;
    const filter =
      isActive !== undefined ? { isActive: isActive === "true" } : {};

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    const activities = await Activity.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single activity by ID
export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE new activity
export const createActivity = async (req, res) => {
  try {
    console.log("req video file:", req.files?.video);
    console.log("req image files:", req.files?.images);

    /* ---------------- PARSE BODY ---------------- */
    const data = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      fullDescription: req.body.fullDescription,
      category: req.body.category,
      location: req.body.location,
      tags: parseJSON(req.body.tags, []),
      duration: parseJSON(req.body.duration, {}),
      languages: parseJSON(req.body.languages, []),
      liveGuide: req.body.liveGuide === "true",

      cancellationPolicy: parseJSON(req.body.cancellationPolicy, {}),
      reservePolicy: parseJSON(req.body.reservePolicy, {}),
      pickup: parseJSON(req.body.pickup, {}),

      variants: parseJSON(req.body.variants, []),
      availableDates: parseJSON(req.body.availableDates, []),
      timeSlots: parseJSON(req.body.timeSlots, []),
      itinerary: parseJSON(req.body.itinerary, []),
      highlights: parseJSON(req.body.highlights, []),
      includes: parseJSON(req.body.includes, []),
      excludes: parseJSON(req.body.excludes, []),
      addons: parseJSON(req.body.addons, []),
      notSuitableFor: parseJSON(req.body.notSuitableFor, []),
      importantInfo: parseJSON(req.body.importantInfo, []),

      isActive: req.body.isActive === "true",
    };

    /* ---------------- UPLOAD IMAGES ---------------- */
    if (req.files?.images?.length) {
      const uploadedImages = await uploadFileToCloudinary(
        req.files.images,
        "activities/images"
      );

      data.images = uploadedImages.map((img, index) => ({
        url: img.url,
        public_id: img.public_id,
        isMain: index === 0,
      }));
    }

    /* ---------------- UPLOAD VIDEO ---------------- */
    if (req.files?.video?.length) {
      const [video] = await uploadFileToCloudinary(
        req.files.video,
        "activities/videos"
      );

      data.video = {
        url: video.url,
        public_id: video.public_id,
      };
    }

    /* ---------------- SAVE ---------------- */
    const activity = await Activity.create(data);

    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    console.error("Create Activity Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE activity (full replace or partial)
export const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE activity
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle active status (soft enable/disable)
export const toggleActive = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    activity.isActive = !activity.isActive;
    await activity.save();

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
