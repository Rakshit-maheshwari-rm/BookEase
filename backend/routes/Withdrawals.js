const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAdmin } = require("../middleware");
const WithdrawalController = require("../controllers/Withdrawals");

router.post('/post', isLoggedIn, WithdrawalController.post);
router.get('/get', isLoggedIn, WithdrawalController.get);

// Admin Routes
router.get('/admin/all', isLoggedIn, isAdmin, WithdrawalController.adminGetAll);
router.put('/admin/:id/status', isLoggedIn, isAdmin, WithdrawalController.adminUpdateStatus);

module.exports = router;