import express from "express";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const { name, email, role, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    if (name && name.trim() !== "") {
      filter.name = { $regex: name.trim(), $options: "i" };
    }

    if (email && email.trim() !== "") {
      filter.email = { $regex: email.trim(), $options: "i" };
    }

   if (role && role.trim() !== "") {
  filter.role = {
    $regex: `^${role.trim()}$`,
    $options: "i",
  };
}
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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -refresh_token");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      message: "Server error while fetching user",
    });
  }
};