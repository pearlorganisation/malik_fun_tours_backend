import express from "express";
export const getMe = (req, res) => {
  res.json({
    success: true,
    message: "Fetched user successfully",
    user: req.user,
  });
};

