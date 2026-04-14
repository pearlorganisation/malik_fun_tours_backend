import mongoose from "mongoose";

const spotSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
    },

  category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true,
},

    location: {
      type: String, // City Center
      required: true,
    },

    image: {
      type: String, // Image URL
      required: true,
    },

    // Ratings
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number, // e.g. 1000+
      default: 0,
    },

    // Overview
    overview: {
      type: String,
      required: true,
    },

    // Things To Do
    thingsToDo: [
      {
        title: String, // Sightseeing, Dining, Shopping
        description: String,
      },
    ],

    // How To Get There
    howToGetThere: [
      {
        mode: {
          type: String, // Metro, Taxi/Car, Parking
        },
        description: String,
      },
    ],

    // Visitor Information
    visitorInfo: {
      openingHours: String,
      entryFee: String,
      address: String,
      directionsLink: String, // Google Maps URL
    },

    // Where To Stay
    whereToStay: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "Place",
         ref: "Hotel",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Spot schema
spotSchema.index({ title: "text" });


export default mongoose.model("Spot", spotSchema);
