import Place from "../models/Place.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../configs/cloudinary.js";
import slugify from "slugify";

/* ================= CREATE PLACE ================= */
export const createPlace = async (req, res) => {
  try {
    const {
      name,
      country,
      region,
      tagline,
      about,
      quickFacts,
      travelTips,
      map,
      keyLandmarks,
      travelGuide,
      whereToStay,
    } = req.body;

    let heroImageUrl = "";

    if (req.file) {
      const [image] = await uploadFileToCloudinary(req.file, "places");
      heroImageUrl = image.url;
    }

    const place = await Place.create({
      name,
      slug: slugify(name, { lower: true }),
      country,
      region,
      tagline,
      heroImage: heroImageUrl,
      about,
      quickFacts: quickFacts ? JSON.parse(quickFacts) : {},
      travelTips: travelTips ? JSON.parse(travelTips) : [],
      map: map ? JSON.parse(map) : {},
      keyLandmarks: keyLandmarks ? JSON.parse(keyLandmarks) : [],
      travelGuide: travelGuide ? JSON.parse(travelGuide) : {},
      whereToStay: whereToStay ? JSON.parse(whereToStay) : [],
    });

    res.status(201).json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET ALL PLACES ================= */
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

    res.json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET PLACE BY ID ================= */
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("travelGuide.mustVisitSpots")
      .populate("travelGuide.shoppingAndMalls")
      .populate("travelGuide.beaches")
      .populate("travelGuide.parksAndNature")
      .populate("travelGuide.freeActivities")
      .populate("whereToStay");

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    res.json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPDATE PLACE ================= */
export const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    let heroImageUrl = place.heroImage;

    if (req.file) {
      const [image] = await uploadFileToCloudinary(req.file, "places");
      heroImageUrl = image.url;
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        heroImage: heroImageUrl,
        quickFacts: req.body.quickFacts
          ? JSON.parse(req.body.quickFacts)
          : place.quickFacts,
        travelTips: req.body.travelTips
          ? JSON.parse(req.body.travelTips)
          : place.travelTips,
        map: req.body.map ? JSON.parse(req.body.map) : place.map,
        keyLandmarks: req.body.keyLandmarks
          ? JSON.parse(req.body.keyLandmarks)
          : place.keyLandmarks,
        travelGuide: req.body.travelGuide
          ? JSON.parse(req.body.travelGuide)
          : place.travelGuide,
        whereToStay: req.body.whereToStay
          ? JSON.parse(req.body.whereToStay)
          : place.whereToStay,
      },
      { new: true }
    );

    res.json({ success: true, data: updatedPlace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE PLACE ================= */
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

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
