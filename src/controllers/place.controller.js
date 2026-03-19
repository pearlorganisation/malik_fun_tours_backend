import Place from "../models/Place.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../configs/cloudinary.js";
import slugify from "slugify";

// HELPER: Ensures latitude and longitude are actual numbers for MongoDB
const parseCoordinates = (obj) => {
  if (!obj) return obj;
  return {
    ...obj,
    latitude: obj.latitude ? Number(obj.latitude) : 0,
    longitude: obj.longitude ? Number(obj.longitude) : 0,
  };
};

/* ================= CREATE PLACE ================= */
export const createPlace = async (req, res) => {
  try {
    const { name, country, region, tagline, about } = req.body;

    let heroImageUrl = "";
    if (req.file) {
      const [image] = await uploadFileToCloudinary(req.file, "places");
      heroImageUrl = image.url;
    }

    // 1. Parse JSON strings from FormData
    const quickFacts = req.body.quickFacts ? JSON.parse(req.body.quickFacts) : {};
    const travelTips = req.body.travelTips ? JSON.parse(req.body.travelTips) : [];
    const travelGuide = req.body.travelGuide ? JSON.parse(req.body.travelGuide) : {};
    const whereToStay = req.body.whereToStay ? JSON.parse(req.body.whereToStay) : [];

    // 2. Parse and Clean Coordinates (Convert string to Number)
    const map = req.body.map ? parseCoordinates(JSON.parse(req.body.map)) : {};
    
    const keyLandmarks = req.body.keyLandmarks 
      ? JSON.parse(req.body.keyLandmarks).map(lm => parseCoordinates(lm)) 
      : [];

    const place = await Place.create({
      name,
      slug: slugify(name, { lower: true }),
      country,
      region,
      tagline,
      heroImage: heroImageUrl,
      about,
      quickFacts,
      travelTips,
      map,
      keyLandmarks,
      travelGuide,
      whereToStay,
    });

    res.status(201).json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE PLACE ================= */
export const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    let heroImageUrl = place.heroImage;
    if (req.file) {
      const [image] = await uploadFileToCloudinary(req.file, "places");
      heroImageUrl = image.url;
    }

    // Prepare update object
    const updateData = {
      ...req.body,
      heroImage: heroImageUrl,
    };

    // Parse and Sanitize JSON fields
    if (req.body.quickFacts) updateData.quickFacts = JSON.parse(req.body.quickFacts);
    if (req.body.travelTips) updateData.travelTips = JSON.parse(req.body.travelTips);
    if (req.body.travelGuide) updateData.travelGuide = JSON.parse(req.body.travelGuide);
    if (req.body.whereToStay) updateData.whereToStay = JSON.parse(req.body.whereToStay);

    // Special handling for Coordinates (Converting to Numbers)
    if (req.body.map) {
      updateData.map = parseCoordinates(JSON.parse(req.body.map));
    }
    if (req.body.keyLandmarks) {
      updateData.keyLandmarks = JSON.parse(req.body.keyLandmarks).map(lm => parseCoordinates(lm));
    }

    if (req.body.name) updateData.slug = slugify(req.body.name, { lower: true });

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedPlace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... Rest of functions (getAllPlaces, getPlaceById, deletePlace) stay the same ...

export const getAllPlaces = async (req, res) => {
    try {
      const places = await Place.find()
        .populate("travelGuide.mustVisitSpots")
        .populate("travelGuide.shoppingAndMalls")
        .populate("travelGuide.beaches")
        .populate("travelGuide.parksAndNature")
        .populate("travelGuide.freeActivities")
        .populate("whereToStay")
        .sort({ createdAt: -1 });
  
      res.json({ success: true, count: places.length, data: places });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const getPlaceById = async (req, res) => {
    try {
      const place = await Place.findById(req.params.id)
        .populate("travelGuide.mustVisitSpots")
        .populate("travelGuide.shoppingAndMalls")
        .populate("travelGuide.beaches")
        .populate("travelGuide.parksAndNature")
        .populate("travelGuide.freeActivities")
        .populate("whereToStay");
  
      if (!place) return res.status(404).json({ message: "Place not found" });
      res.json({ success: true, data: place });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const deletePlace = async (req, res) => {
    try {
      const place = await Place.findById(req.params.id);
      if (!place) return res.status(404).json({ message: "Place not found" });
  
      if (place.heroImage) {
        const publicId = place.heroImage.split("/").pop().split(".")[0];
        await deleteFileFromCloudinary({
          public_id: `fun_tours/places/${publicId}`,
          resource_type: "image",
        });
      }
      await place.deleteOne();
      res.json({ success: true, message: "Place deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };