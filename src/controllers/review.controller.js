import mongoose from "mongoose";
import Review from "../models/Review.js";
import Activity from "../models/Activity.js";
export const createReview = async (req, res) => {
  try {
    const { activityId, rating, comment } = req.body;

    await Review.create({
      activity: activityId,
      user: req.user._id,
      rating,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { activity: new mongoose.Types.ObjectId(activityId) } },
      {
        $group: {
          _id: "$activity",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Activity.findByIdAndUpdate(activityId, {
      rating: Number(stats[0].avgRating.toFixed(1)),
      reviewCount: stats[0].count,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getActivityReviews = async (req, res) => {
  try {
    const { activityId } = req.params;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ activity: activityId })
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ activity: activityId }),
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id, // 🔒 only owner can edit
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    // 🔁 Recalculate activity rating
    const stats = await Review.aggregate([
      { $match: { activity: new mongoose.Types.ObjectId(review.activity) } },
      {
        $group: {
          _id: "$activity",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Activity.findByIdAndUpdate(review.activity, {
      rating: Number(stats[0].avgRating.toFixed(1)),
      reviewCount: stats[0].count,
    });

    res.json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.user._id, // 🔒 only owner
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 🔁 Recalculate activity rating
    const stats = await Review.aggregate([
      { $match: { activity: new mongoose.Types.ObjectId(review.activity) } },
      {
        $group: {
          _id: "$activity",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Activity.findByIdAndUpdate(review.activity, {
        rating: Number(stats[0].avgRating.toFixed(1)),
        reviewCount: stats[0].count,
      });
    } else {
      // no reviews left
      await Activity.findByIdAndUpdate(review.activity, {
        rating: 0,
        reviewCount: 0,
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};