const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "luxury-villa", "beachfront", "mountain-cabin", "urban-apartment",
        "countryside-cottage", "boutique-hotel", "treehouse", "farmhouse",
        "chalet", "houseboat", "mansion", "castle", "glamping", "tiny-home",
        "camper-rv", "yurt", "barn", "windmill", "lighthouse", "cave",
        "igloo", "riad", "trullo", "ryokan", "shepherds-hut", "tent",
        "dome", "earthhouse", "house",
        "apartment", "villa", "hotel", "cottage", "resort", "cabin", "guest-house"
      ],
      default: "house",
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 1,
    },

    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },

    personsPerRoom: {
      type: Number,
      required: true,
      min: 1,
    },

    images: {
      mainImage: {
        type: String,
        required: true,
      },
      gallery: [
        {
          type: String,
          required: true,
        },
      ],
    },

    amenities: [
      {
        type: String,
        required: true,
      },
    ],

    pricing: {
      price: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      serviceFee: {
        type: Number,
        default: 0
      },
      cleaningFee: {
        type: Number,
        default: 0
      }
    },

    inventory: {
      type: Number,
      min: 1,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],

    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ isActive: 1, type: 1, "pricing.price": 1 });
ListingSchema.index({ city: 1, state: 1, country: 1 });
ListingSchema.index({ owner: 1, isActive: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ isActive: 1, personsPerRoom: 1, "pricing.price": 1 });
ListingSchema.index({ avgRating: -1 });

module.exports = mongoose.model('Listing', ListingSchema);