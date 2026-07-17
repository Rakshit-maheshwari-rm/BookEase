const express = require("express");
const router = express.Router({ mergeParams: true });
const UserController = require("../controllers/User");
const upload = require("../multer");
const { isLoggedIn, isAdmin } = require("../middleware");
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many attempts from this IP, please try again after 15 minutes."
    }
});

router.post('/signup', authLimiter, upload.single("image"), UserController.signup);
router.post('/login', authLimiter, UserController.login);
router.post('/logout', UserController.logout);
router.get('/check-user', UserController.checkUser);
router.put('/profile-update', isLoggedIn, upload.single("image"), UserController.update);
router.put('/add-to-fav/:id', isLoggedIn, UserController.addToFavorites);
router.put('/remove-fav/:id', isLoggedIn, UserController.removeFromFavorites);
router.get('/dashboard-stats', isLoggedIn, UserController.dashboardStats);

// Admin Routes
router.get('/admin/users', isLoggedIn, isAdmin, UserController.getAllUsers);
router.put('/admin/users/:id/status', isLoggedIn, isAdmin, UserController.updateUserStatus);
router.delete('/admin/users/:id', isLoggedIn, isAdmin, UserController.deleteUser);

module.exports = router;