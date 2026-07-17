const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const Rating = require("../models/Rating");

module.exports.post = async (req, res) => {
    try {
        const { post } = req.body;
        const { id } = req.params;

        if (!post || !post.message || !post.rating) {
            return res.json({
                success: false,
                message: "Message and rating are required",
            });
        }

        const review = await Rating.create({
            listing: id,
            message: post.message,
            rating: post.rating,
            owner: req.user._id
        });

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.json({
                success: false,
                message: "Listing not found",
            });
        }
        await Listing.findByIdAndUpdate(id, { $push: { reviews: review._id } });
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

module.exports.get = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Rating.find({ listing: id }).populate("owner").populate("listing");

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
            return res.json({ success: false, message: "Review not found" });
        }

        const listing = await Listing.findById(rating.listing);
        await Rating.findByIdAndDelete(id);

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
        res.json({
            success: true,
            message: "Successfully deleted"
        });
    } catch (error) {
        res.status(500).json({
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
        console.log(error);
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
        if (existReview) {
            const listing = await Listing.findById(existReview.listing);
            existReview.message = message;
            existReview.rating = rating;
            await existReview.save();

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
            res.json({
                success: true,
                message: "Successfully updated",
                review: existReview
            });
        }
    } catch (error) {
        res.status(500).json({
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