import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // Needed for deletion
  alt: { type: String },
  isMain: { type: Boolean, default: false },
});

const PricingSchema = new mongoose.Schema({
  label: String, // e.g. "Adult", "Child"
  type: {
    type: String,
    enum: ["per_person", "per_vehicle", "flat"],
    required: true,
  },
  minParticipants: Number,
  maxParticipants: Number,
  price: { type: Number, required: true },
  currency: { type: String, default: "AED" },
});

const TimeSlotSchema = new mongoose.Schema({
  startTime: String, // "08:00 AM"
  isAvailable: { type: Boolean, default: true },
});

const ItinerarySchema = new mongoose.Schema({
  title: String, // Pickup, Desert Stop, Drop-off
  location: String,
  activities: [String],
  optionalAddons: [String],
});

const AddonSchema = new mongoose.Schema({
  title: String,
  duration: String, // "30 min"
  price: Number,
});

const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Standard", "Premium", "VIP", "Private", "Super Deluxe"
  description: String, // Short description of what makes this variant special
  images: [ImageSchema], // Variant-specific images (optional)
  pricing: [PricingSchema], // Pricing for this variant (e.g. Adult/Child prices)
  includes: [String], // What is included in this variant
  excludes: [String], // What is NOT included (or extra)
  addons: [AddonSchema], // Optional addons specific to this variant
  highlights: [String], // Key highlights/upgrades for this variant
  discount: {
    percentage: Number,
    label: String, // e.g. "Save 20%"
  },
  isActive: { type: Boolean, default: true },
});

const ActivitySchema = new mongoose.Schema(
  {
    // ---------------- BASIC INFO ----------------
    title: { type: String, required: true }, // e.g. "Evening Desert Safari"
    shortDescription: String,
    fullDescription: String,
    category: { type: String, required: true }, // e.g. "Desert Safari", "City Tour"
    location: String, // e.g. "Dubai Desert Conservation Reserve"
    tags: [String], // e.g. ["family-friendly", "adventure", "cultural"]
    // ---------------- MAIN IMAGES (shared across variants) ----------------
    images: [ImageSchema],
    // Promotional video
    video: {
      url: { type: String },
      public_id: { type: String }, // For deletion if needed
    },
    // ---------------- META DETAILS (shared) ----------------
    duration: {
      label: String, // "7 Hours"
      hours: Number,
    },
    languages: [String],
    liveGuide: Boolean,

    // ---------------- POLICIES (shared) ----------------
    cancellationPolicy: {
      isFreeCancellation: Boolean,
      hoursBefore: Number,
    },
    reservePolicy: {
      payLater: Boolean,
      description: String,
    },

    // ---------------- PICKUP (shared or can vary per variant) ----------------
    pickup: {
      included: Boolean,
      description: String,
      locations: [String],
      privateForOutskirts: Boolean,
    },

    // ---------------- VARIANTS (multiple plans/packages) ----------------
    variants: [VariantSchema], // This replaces the old single 'pricing' array

    // ---------------- AVAILABILITY (shared) ----------------
    availableDates: [Date],
    timeSlots: [TimeSlotSchema],

    // ---------------- ITINERARY (shared or variant-specific if needed) ----------------
    itinerary: [ItinerarySchema],

    // ---------------- SHARED HIGHLIGHTS / INCLUSIONS ----------------
    highlights: [String],
    includes: [String],
    excludes: [String],

    // ---------------- SHARED ADDONS (if common) ----------------
    addons: [AddonSchema],

    // ---------------- RESTRICTIONS ----------------
    notSuitableFor: [String],
    importantInfo: [String],

    // ---------------- REVIEWS ----------------
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // ---------------- STATUS ----------------
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", ActivitySchema);
