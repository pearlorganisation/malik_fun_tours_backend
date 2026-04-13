import Tour from "../models/tour.model.js";

// 1. Create New Booking
export const createTour = async (req, res) => {
  try {
    const newTour = new Tour(req.body);
    const savedTour = await newTour.save();
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedTour,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Bookings
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Single Booking by ID
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Booking
export const deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    if (!deletedTour) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};