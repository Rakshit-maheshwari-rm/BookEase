const express = require("express");
const router = express.Router({ mergeParams: true });
const BookingController = require("../controllers/Booking");
const { isLoggedIn, isAdmin } = require("../middleware");

router.post('/make-booking', isLoggedIn, BookingController.post);
router.post('/verify-payment', isLoggedIn, BookingController.verifyPayment);
router.get('/get-booking', isLoggedIn, BookingController.get);
router.get('/all-booking', isLoggedIn, BookingController.host);
router.put('/:id', isLoggedIn, BookingController.updateStatus);

// Admin Routes
router.get('/admin/all', isLoggedIn, isAdmin, BookingController.adminGetAll);
router.delete('/admin/:id', isLoggedIn, isAdmin, BookingController.adminDelete);

module.exports = router;