import Inquiry from "../models/Inquiry.js";

export const createInquiry = async (req, res) => {
  try {
    const {
      tourId,
      tourName,
      adults,
      kids,
      requirement,
      name,
      email,
      phone,
    } = req.body;

    // ✅ basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required",
      });
    }

    const inquiry = await Inquiry.create({
      tourId,
      tourName,
      adults,
      kids,
      requirement,
      name,
      email,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};