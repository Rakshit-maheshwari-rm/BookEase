const express = require("express");
const router = express.Router({ mergeParams: true });
const ListingController = require("../controllers/Listing");
const { isLoggedIn, cacheMiddleware, isAdmin } = require("../middleware");
const upload = require("../multer");

router.post('/create', isLoggedIn, upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "gallery", maxCount: 5 },]), ListingController.create);
router.get('/all', cacheMiddleware(300), ListingController.all);
router.get('/search', cacheMiddleware(300), ListingController.search);
router.get('/explore', cacheMiddleware(300), ListingController.explore);
router.get('/destination-finder', cacheMiddleware(300), ListingController.destinationFinder);
router.delete('/host-delete/:id', isLoggedIn, ListingController.hostDelete);
router.get('/host-listings', isLoggedIn, ListingController.getHostListing);
// Admin Routes
router.get('/admin/all', isLoggedIn, isAdmin, ListingController.adminGetAll);
router.put('/admin/:id/status', isLoggedIn, isAdmin, ListingController.adminUpdateStatus);
router.delete('/admin/:id', isLoggedIn, isAdmin, ListingController.adminDelete);

router.put('/:id', isLoggedIn, upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "gallery", maxCount: 5 },]), ListingController.update);
router.get('/:id', cacheMiddleware(300), ListingController.get);
router.delete('/:id', isLoggedIn, ListingController.delete);

module.exports = router;