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



// @desc    Get all inquiries (For Admin)
// @route   GET /api/inquiries
export const getAllInquiries = async (req, res) => {
  try {
    // We sort by createdAt: -1 to show the newest inquiries first
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).populate("tourId");
    
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inquiry by ID
// @route   GET /api/inquiries/:id
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate("tourId");
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Inquiry Status
// @route   PATCH /api/inquiries/:id/status
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in-progress", "resolved", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, message: "Status updated", data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Inquiry
// @route   DELETE /api/inquiries/:id
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};