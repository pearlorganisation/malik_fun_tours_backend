import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    /* ---------- BASIC INFO ---------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    Images: [
      {
        secure_url: String,
        publicId: String,
      },
    ],
    /* ---------- EXPERIENCE ---------- */
    Experience: {
      title: {
        type: String,
        required: true,
      },
      note: {
        type: String,
      },
      description: {
        type: String,
        required: true,
      },
      highlights: {
        type: [String], // array of strings
        default: [],
      },
    },

    /* ---------- ITINERARY ---------- */
    Itinerary: [
      {
        time: {
          type: String,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        image: {
          secure_url: String,
          publicId: String,
        },
      },
    ],

    /* ---------- INFO & LOGISTICS ---------- */
    InfoAndLogistics: {
      pickupZone: {
        description: {
          type: String,
        },
        mapLink: {
          type: String,
        },
      },

      keyInfo: {
        type: [String],
        default: [],
      },

      essentialGuide: {
        type: [String],
        default: [],
      },
    },

    /* ---------- REVIEWS (REFERENCE) ---------- */
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    BBQ_BUFFET: {
      title: String,
      description: String,
      fields: [
        {
          category: {
            type: String,
            required: true,
          },
          items: {
            type: [String],
            default: [],
          },
        },
      ],
    },

    PrivateSUV: {
      available: {
        type: Boolean,
        default: false,
      },
      fee: Number,
      model: {
        type: String,
        default: "SUV",
      },
    },
    /* ---------- STATUS ---------- */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.virtual("packages", {
  ref: "Package", // model name
  localField: "_id", // Activity _id
  foreignField: "activityId", // Package.activityId
});
ActivitySchema.set("toJSON", { virtuals: true });
ActivitySchema.set("toObject", { virtuals: true });


export default mongoose.model("Activity", ActivitySchema);
