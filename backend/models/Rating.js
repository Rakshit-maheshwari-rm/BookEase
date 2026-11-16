const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
    },
    status: {
        type: String,
        enum: ["approved", "flagged", "rejected"],
        default: "approved"
    },
    moderation: {
        isToxic: {
            type: Boolean,
            default: false
        },
        isSpam: {
            type: Boolean,
            default: false
        },
        confidenceScore: {
            type: Number,
            default: 0
        },
        flagReason: {
            type: String,
            default: null
        },
        moderatedAt: {
            type: Date,
            default: Date.now
        }
    }
},
    {
        timestamps: true,
    }
);

RatingSchema.index({ listing: 1, status: 1 });
RatingSchema.index({ owner: 1, createdAt: -1 });

RatingSchema.statics.calculateAverageRating = async function (listingId) {
    if (!listingId) return;
    try {
        const stats = await this.aggregate([
            {
                $match: {
                    listing: new mongoose.Types.ObjectId(listingId),
                    status: { $ne: "rejected" }
                }
            },
            {
                $group: {
                    _id: "$listing",
                    totalRatings: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            }
        ]);

        if (stats.length > 0) {
            await mongoose.model("Listing").findByIdAndUpdate(listingId, {
                totalRatings: stats[0].totalRatings,
                avgRating: Math.round(stats[0].avgRating * 10) / 10
            });
        } else {
            await mongoose.model("Listing").findByIdAndUpdate(listingId, {
                totalRatings: 0,
                avgRating: 0
            });
        }
    } catch (err) {
        console.error("calculateAverageRating error:", err);
    }
};

module.exports = mongoose.model('Rating', RatingSchema);