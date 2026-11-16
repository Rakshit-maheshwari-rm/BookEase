const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const Rating = require("../models/Rating");
const NodeCache = require("node-cache");
const { summarizeReviews, moderateReview } = require("../services/aiService");
const { invalidateListingCache } = require("../middleware");

const reviewCache = new NodeCache({ stdTTL: 3600 });

module.exports.post = async (req, res) => {
    try {
        const { post } = req.body;
        const { id } = req.params;

        if (!post || !post.message || !post.rating) {
            return res.status(400).json({
                success: false,
                message: "Message and rating are required",
            });
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found",
            });
        }

        let moderationResult = {
            status: "approved",
            isToxic: false,
            isSpam: false,
            confidenceScore: 100,
            flagReason: "Clean review"
        };

        try {
            moderationResult = await moderateReview({
                message: post.message,
                rating: post.rating,
                listingTitle: listing.title
            });
        } catch (aiError) {
            moderationResult.status = "approved";
        }

        if (moderationResult.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: `Review cannot be posted: ${moderationResult.flagReason}`
            });
        }

        const review = await Rating.create({
            listing: id,
            message: post.message,
            rating: post.rating,
            owner: req.user._id,
            status: moderationResult.status,
            moderation: {
                isToxic: moderationResult.isToxic,
                isSpam: moderationResult.isSpam,
                confidenceScore: moderationResult.confidenceScore,
                flagReason: moderationResult.flagReason
            }
        });

        await Listing.findByIdAndUpdate(id, { $push: { reviews: review._id } });
        await Rating.calculateAverageRating(id);
        invalidateListingCache(id);
        try {
            await Notification.create([
                {
                    user: req.user._id,
                    title: "Review",
                    message: `You posted a review on ${listing.title}`,
                },
                {
                    user: listing.owner,
                    title: "New Review",
                    message: `New review on your listing "${listing.title}"`,
                }
            ]);
        } catch (notifError) {
            console.error("Failed to create notifications for review:", notifError);
        }
        res.json({
            success: true,
            message: "Successfully posted review", review
        });
    } catch (error) {
        console.error("Error posting rating:", error);
        res.status(500).json({
            success: false,
            message: "Failed to post rating"
        });
    }
};

module.exports.getTopReviews = async (req, res) => {
    try {
        const reviews = await Rating.find({
            status: { $ne: "rejected" },
            rating: { $gte: 4 }
        })
            .populate("owner", "username image")
            .populate("listing", "title city country")
            .sort({ rating: -1, createdAt: -1 })
            .limit(6)
            .lean();

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Error fetching top reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top reviews"
        });
    }
};

module.exports.get = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Rating.find({ listing: id, status: { $ne: "rejected" } }).populate("owner").populate("listing");

        res.json({
            success: true,
            count: result.length,
            message: "Successfully get all ratings", result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get all ratings"
        });
    }
};

module.exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findById(id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const isOwner = rating.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review"
            });
        }

        const listing = await Listing.findById(rating.listing);
        await Rating.findByIdAndDelete(id);

        if (rating.listing) {
            await Listing.findByIdAndUpdate(rating.listing, {
                $pull: { reviews: id }
            });
            await Rating.calculateAverageRating(rating.listing);
            invalidateListingCache(rating.listing);
        }

        if (listing) {
            await Notification.create([
                {
                    user: rating.owner,
                    title: "Review Deleted",
                    message: `Your review on "${listing.title}" was deleted`,
                    isRead: false,
                },
                {
                    user: listing.owner,
                    title: "Review Deleted",
                    message: `A review on your listing "${listing.title}" was deleted`,
                    isRead: false,
                }
            ]);
        }

        return res.status(200).json({
            success: true,
            message: "Successfully deleted review"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete rating"
        });
    }
};

module.exports.getAllRatings = async (req, res) => {
    try {
        const userId = req.params.id;
        const allListing = await Listing.find({ owner: userId });
        const allId = allListing.map(list => list._id);
        const allRatings = await Rating.find({
            listing: { $in: allId }
        }).populate("owner", "username image").populate("listing", "title");
        let totalRating = 0;

        allRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        const avgRating = allRatings.length ? (totalRating / allRatings.length).toFixed(1) : 0;
        res.json({
            success: true,
            allRatings,
            totalRating: allRatings.length,
            avgRating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get total rating"
        });
    }
};

module.exports.userRating = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Rating.find({ owner: id }).populate("owner").populate("listing");

        if (!result) {
            return res.json({
                success: false,
                message: "No reviews"
            });
        }
        res.json({
            success: true,
            message: result || []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: []
        });
    }
};

module.exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, rating } = req.body;

        const existReview = await Rating.findById(id);

        if (!existReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const isOwner = existReview.owner.toString() === req.user._id.toString();
        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this review"
            });
        }

        if (rating !== undefined) {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 1 || numRating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be a number between 1 and 5"
                });
            }
            existReview.rating = numRating;
        }

        if (message !== undefined) {
            if (!message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Review message cannot be empty"
                });
            }
            existReview.message = message.trim();
        }

        await existReview.save();
        await Rating.calculateAverageRating(existReview.listing);
        invalidateListingCache(existReview.listing);

        const listing = await Listing.findById(existReview.listing);

        if (listing) {
            await Notification.create([
                {
                    user: existReview.owner,
                    title: "Review Updated",
                    message: `Your review on "${listing.title}" was updated`,
                    isRead: false,
                },
                {
                    user: listing.owner,
                    title: "Review Updated",
                    message: `A review on your listing "${listing.title}" was updated`,
                    isRead: false,
                }
            ]);
        }

        return res.status(200).json({
            success: true,
            message: "Successfully updated review",
            review: existReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update review"
        });
    }
};

module.exports.adminGetAll = async (req, res) => {
    try {
        const ratings = await Rating.find({}).populate("owner", "username image").populate("listing", "title").sort({ createdAt: -1 });
        res.json({
            success: true,
            ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch all reviews"
        });
    }
};

module.exports.adminDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findById(id);
        if (!rating) {
            return res.json({
                success: false,
                message: "Review not found"
            });
        }
        await Rating.findByIdAndDelete(id);

        if (rating.listing) {
            await Listing.findByIdAndUpdate(rating.listing, { $pull: { reviews: id } });
            await Rating.calculateAverageRating(rating.listing);
            invalidateListingCache(rating.listing);
        }
        res.json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
};

module.exports.adminUpdateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "flagged", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'approved', 'flagged', or 'rejected'."
            });
        }

        const review = await Rating.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("owner", "username image").populate("listing", "title");

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (review.listing) {
            const listingId = review.listing._id || review.listing;
            await Rating.calculateAverageRating(listingId);
            invalidateListingCache(listingId);
        }

        res.json({
            success: true,
            message: `Review marked as ${status}`,
            review
        });
    } catch (error) {
        console.error("Admin update review status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update review status"
        });
    }
};

module.exports.getAiSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `ai_summary_${id}`;

        const cachedData = reviewCache.get(cacheKey);
        if (cachedData) {
            return res.json({
                success: true,
                cached: true,
                ...cachedData
            });
        }

        const listing = await Listing.findById(id).select("title");
        const reviews = await Rating.find({ listing: id }).select("message rating");

        if (!reviews || reviews.length === 0) {
            return res.json({
                success: true,
                hasReviews: false,
                message: "No reviews available yet to summarize."
            });
        }

        const aiResult = await summarizeReviews(reviews, listing?.title || "Property");

        const response = {
            hasReviews: true,
            totalReviewsAnalyzed: reviews.length,
            ...aiResult
        }

        reviewCache.set(cacheKey, response);

        res.json({
            success: true,
            cached: false,
            ...response
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Failed to generate AI review summary",
        });
    }
};