const express = require("express");
const router = express.Router({ mergeParams: true });
const RatingController = require("../controllers/Rating");
const { isLoggedIn, isAdmin } = require("../middleware");

router.get('/top-reviews', RatingController.getTopReviews); // Fetch top-rated platform reviews for homepage
router.post('/:id/post', isLoggedIn, RatingController.post); //Post a new rating
router.get('/:id/get', isLoggedIn, RatingController.get); //Fetch all review for a specific listing
router.delete('/delete/:id', isLoggedIn, RatingController.delete); // Delete an existing review
router.get('/all/:id', RatingController.getAllRatings); //Gets the aggregate rating statistics for a host
router.get('/user/:id', isLoggedIn, RatingController.userRating); //Fetches all reviews written by a specific user
router.put('/update/:id', isLoggedIn, RatingController.update); // Update an existing rating
router.get('/:id/ai-summary', RatingController.getAiSummary); //AI Reviews summary

// Admin Routes
router.get('/admin/all', isLoggedIn, isAdmin, RatingController.adminGetAll);
router.delete('/admin/:id', isLoggedIn, isAdmin, RatingController.adminDelete);
router.put('/admin/:id/status', isLoggedIn, isAdmin, RatingController.adminUpdateStatus);

module.exports = router;