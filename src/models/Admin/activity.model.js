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
      unique: true,
      lowercase: true,
      index: true,
    },
    sourceActivityId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Activity_Malik",
  required: false,
  default: null,
},
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    packageCount: {
  type: Number,
  default: 0,
  min: 0
},
    Images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    Video: {
      secure_url: String,
      public_id: String,
    },
    /* ---------- TIME SLOTS ---------- */
    timeSlots: [
      {
        type: String,
        trim: true,
        match: [
          /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
          "Invalid time format. Use HH:MM AM/PM",
        ],
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
        note: {
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
       seat :{
      type : Number,
      default : 0
      
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

ActivitySchema.index({ name: "text" });
ActivitySchema.index({ categoryId: 1 });
ActivitySchema.index({ placeId: 1 });
  

ActivitySchema.virtual("packages", {
  ref: "Package", // model name
  localField: "_id", // Activity _id
  foreignField: "activityId", // Package.activityId
});
ActivitySchema.set("toJSON", { virtuals: true });
ActivitySchema.set("toObject", { virtuals: true });

const Activity =mongoose.model("Activity_Malik", ActivitySchema);

export default Activity;