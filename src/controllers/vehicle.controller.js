import Vehicle from "../models/Vehicle.js";
import {
    asyncHandler
} from "../utils/error/asyncHandler.js";

// Create a new vehicle
export const create_vehicle = asyncHandler(async (req, res, next) => {
    let {
        amenities,
        ...rest
    } = req.body;

    // If amenities are sent as a string, parse it into an array
    if (typeof amenities === "string") {
        try {
            amenities = JSON.parse(amenities);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid amenities format. It should be a valid JSON array.",
            });
        }
    }

    const vehicle = await Vehicle.create({
        ...rest,
        amenities,
    });

    return res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
    });
});
// Get all vehicles
export const get_all_vehicles = asyncHandler(async (req, res, next) => {
    const vehicles = await Vehicle.find().populate("destination");

    return res.status(200).json({
        success: true,
        count: vehicles.length,
        data: vehicles,
    });
});

// Get single vehicle by ID
export const get_single_vehicle = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params;

    const vehicle = await Vehicle.findById(id).populate("destination");

    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: "Vehicle not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: vehicle,
    });
});

// Update vehicle by ID
export const update_vehicle = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params;
    let {
        amenities,
        price,
        ...rest
    } = req.body;

    // Parse amenities if it comes as a stringified JSON
    if (typeof amenities === "string") {
        try {
            amenities = JSON.parse(amenities);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid amenities format. It should be a valid JSON array.",
            });
        }
    }

    // Parse price if it comes as a stringified JSON
    if (typeof price === "string") {
        try {
            price = JSON.parse(price);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid price format. It should be a valid JSON object.",
            });
        }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id, {
            ...rest,
            amenities,
            price
        }, {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedVehicle) {
        return res.status(404).json({
            success: false,
            message: "Vehicle not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: updatedVehicle,
    });
});

// Delete vehicle by ID
export const delete_vehicle = asyncHandler(async (req, res, next) => {
    const {
        id
    } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            message: "Vehicle not found",
        });
    }

    await Vehicle.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
    });
});
