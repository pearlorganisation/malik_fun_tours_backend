import Destination from "../models/Destination.js";

 
 export const createDestination = async (req, res) => {
    try {
        const {
            name,
            destination_description,
            longitude,
            latitude
        } = req.body;

        if (!name || longitude === undefined || latitude === undefined) {
            return res
                .status(400)
                .json({
                    message: "Name, longitude, and latitude are required"
                });
        }

        const destination = await Destination.create({
            name,
            destination_description,
            location: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
        });

        res
            .status(201)
            .json({
                message: "Destination created successfully",
                data: destination
            });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Destination name already exists"
            });
        }
        res.status(500).json({
            message: error.message
        });
    }
};

export const getAllDestinations = async (req, res) => {
    try {
        const {
            name
        } = req.query;

        // Build query object
        let query = {};
        if (name) {
            // Case-insensitive partial match
            query.name = {
                $regex: name,
                $options: "i"
            };
        }

        const destinations = await Destination.find(query).sort({
            createdAt: -1
        });

        res.status(200).json({
            data: destinations
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const getDestinationById = async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination)
            return res.status(404).json({
                message: "Destination not found"
            });
        res.status(200).json({
            data: destination
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const updateDestination = async (req, res) => {
    try {
        const {
            name,
            destination_description,
            longitude,
            latitude
        } = req.body;
        const destination = await Destination.findById(req.params.id);

        if (!destination)
            return res.status(404).json({
                message: "Destination not found"
            });

        if (name) destination.name = name;
        if (destination_description)
            destination.destination_description = destination_description;
        if (longitude && latitude) {
            destination.location = {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            };
        }

        await destination.save();
        res.status(200).json({
            message: "Destination updated successfully",
            data: destination,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const deleteDestination = async (req, res) => {
    try {
        const destination = await Destination.findByIdAndDelete(req.params.id);
        if (!destination)
            return res.status(404).json({
                message: "Destination not found"
            });

        res.status(200).json({
            message: "Destination deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const findNearbyDestinations = async (req, res) => {
    try {
        const {
            longitude,
            latitude,
            radius = 50000
        } = req.query; // radius in meters

        if (!longitude || !latitude) {
            return res
                .status(400)
                .json({
                    message: "longitude and latitude are required"
                });
        }

        const destinations = await Destination.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: parseFloat(radius),
                },
            },
        });

        res.status(200).json({
            data: destinations
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
