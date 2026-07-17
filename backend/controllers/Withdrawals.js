const Withdrawal = require('../models/Withdrawals');
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");

module.exports.post = async (req, res) => {
    const user = req.user;
    const { amount, holderName, bankName, accountNumber, ifsc } = req.body;

    if (!amount || !holderName || !bankName || !accountNumber || !ifsc) {
        return res.json({
            success: false,
            message: "Please provide all the details"
        });
    }

    try {
        const bookings = await Booking.find({ host: user._id });
        let totalRevenue = 0;
        bookings.forEach(item => {
            if (item.status === 'confirmed') {
                totalRevenue += (item.hostRevenue !== undefined ? item.hostRevenue : (item.totalPrice || 0));
            }
        });

        const pastWithdrawals = await Withdrawal.find({ user: user._id, status: { $in: ['pending', 'confirmed'] } });
        let totalWithdrawn = 0;
        pastWithdrawals.forEach(item => {
            totalWithdrawn += (item.amount || 0);
        });

        const availableBalance = totalRevenue - totalWithdrawn;

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.json({
                success: false,
                message: "Invalid amount"
            });
        }

        if (numericAmount > availableBalance) {
            return res.json({
                success: false,
                message: "Can not more than available amount"
            });
        }

        const withdrawalId = 'W-' + Math.floor(100000 + Math.random() * 900000);

        const newWithdrawal = new Withdrawal({
            withdrawalId,
            amount: numericAmount,
            holderName,
            bankName,
            accountNumber,
            ifsc,
            user: user._id,
            status: "pending"
        });

        await newWithdrawal.save();

        await Notification.create({
            user: user._id,
            title: "Withdrawal Requested",
            message: `You have successfully requested a withdrawal of ${amount}.`
        });

        return res.json({
            success: true,
            message: "Withdrawal request submitted successfully",
            withdrawal: newWithdrawal
        });

    } catch (error) {
        console.error("Error in withdrawal request:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports.get = async (req, res) => {
    try {
        const user = req.user;
        const withdrawal = await Withdrawal.find({ user: user._id });

        return res.json({
            success: true,
            message: "Withdrawals fetched successfully",
            withdrawal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports.adminGetAll = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({}).populate("user", "username email").sort({ createdAt: -1 });
        return res.json({
            success: true,
            withdrawals
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all withdrawals"
        });
    }
};

module.exports.adminUpdateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.json({
                success: false,
                message: "Withdrawal request not found"
            });
        }

        withdrawal.status = status;
        await withdrawal.save();

        await Notification.create({
            user: withdrawal.user,
            title: "Withdrawal Status Update",
            message: `Your withdrawal request of ${withdrawal.amount} has been marked as ${status}.`
        });

        return res.json({
            success: true,
            message: `Withdrawal status updated to ${status}`,
            withdrawal
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update withdrawal status"
        });
    }
};