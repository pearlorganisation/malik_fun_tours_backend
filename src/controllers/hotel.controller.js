import Hotel from "../models/hotel.model.js";

/**
 * CREATE HOTEL
 */
export const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ALL HOTELS
 */
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET SINGLE HOTEL
 */
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("location");

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE HOTEL (PARTIAL UPDATE SUPPORT)
 */
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: hotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE HOTEL
 */
// export const deleteHotel = async (req, res) => {
//   try {
//     const hotel = await Hotel.findByIdAndDelete(req.params.id);

//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "Hotel not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Hotel deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    const hotel = await Hotel.findByIdAndDelete(id).lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (err) {
    console.error("Delete Hotel Error:", err); 
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const searchHotels = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, minPrice, maxPrice } = req.query;

    const query = {};

    // 🔍 Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const hotels = await Hotel.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.status(200).json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: hotels,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    const review = {
      rating,
      comment,
      user: req.user?._id, // if auth added
    };

    hotel.reviews.push(review);

    // ⭐ Average rating update
    hotel.avgRating =
      hotel.reviews.reduce((acc, item) => acc + item.rating, 0) /
      hotel.reviews.length;

    await hotel.save();

    res.status(200).json({
      success: true,
      message: "Review added",
      data: hotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTopHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .sort({ avgRating: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getNearbyHotels = async (req, res) => {
  try {
    const { lat, lng, distance = 5 } = req.query;

    const hotels = await Hotel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance * 1000,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const softDeleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Hotel soft deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteHotelAdminOnly = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Deleted by admin",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};