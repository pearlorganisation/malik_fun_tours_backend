import express from "express";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const { name, email, role, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive partial match
    if (email) filter.email = { $regex: email, $options: "i" };
    if (role) filter.role = role;

    // Convert page and limit to numbers with defaults
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch users with pagination and filtering
    const users = await User.find(filter)
      .select("-password -refresh_token")
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination metadata (optional but recommended)
    const totalUsers = await User.countDocuments(filter);

    return res.status(200).json({
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        hasNextPage: pageNumber < Math.ceil(totalUsers / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
      message: "All users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching users" });
  }
};
