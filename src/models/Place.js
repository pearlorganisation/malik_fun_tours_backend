import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    country: {
      type: String,
      default: "UAE",
    },

    region: {
      type: String, // Abu Dhabi
      required: true,
    },

    tagline: {
      type: String, // The Capital of Culture
    },

    heroImage: {
      type: String,
    },

    // Quick Facts
    quickFacts: {
      climate: String, // Desert
      bestTime: String, // Oct - Apr
      nearBy: {
        name: String,
        distance: String,
      }, // 1.5 Hrs
      safety: String, // Very Safe
    },

    // About
    about: {
      type: String,
      required: true,
    },

    // Travel Tips / Info
    travelTips: [
      {
        category: {
          type: String, // Photography, Culture, Transport
        },
        tip: String,
      },
    ],

    // Map Location
    map: {
      latitude: Number,
      longitude: Number,
      mapUrl: String, // Google Maps embed / link
    },

    // Key Landmarks
    keyLandmarks: [
      {
        location: String,
        latitude: Number,
        longitude: Number,
        description: String,
      },
    ],

    // Travel Guide Categories
    travelGuide: {
      mustVisitSpots: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Spot",
        },
      ],
      shoppingAndMalls: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Spot",
        },
      ],
      beaches: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Spot",
        },
      ],
      parksAndNature: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Spot",
        },
      ],
      freeActivities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Spot",
        },
      ],
    },

    // Where To Stay (Hotels / Areas / Malls)
    whereToStay: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel", // or "Place" if hotels are places
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Place", placeSchema);
