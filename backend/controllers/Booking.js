const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const razorpay = require("../razorpay");
const Setting = require("../models/Setting");

module.exports.post = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guest, paymentMethod } = req.body;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            return res.json({ success: false, message: "Check-in date cannot be in the past" });
        }
        if (checkOutDate <= checkInDate) {
            return res.json({ success: false, message: "Check-out date must be after check-in date" });
        }

        const listing = await Listing.findById(listingId);

        const overlappingBookings = await Booking.countDocuments({
            listing: listingId,
            status: { $in: ['confirmed', 'pending'] },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
        });

        if (overlappingBookings >= (listing.inventory || 1)) {
            return res.json({
                success: false,
                message: "No inventory available for these dates"
            });
        }

        const days = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
        const totalPrice = (days * listing.pricing.price) + (listing.pricing.serviceFee || 0) + (listing.pricing.cleaningFee || 0);

        let commissionAmount = 0;
        let hostRevenue = totalPrice;
        try {
            const settings = await Setting.findOne();
            if (settings && settings.platformCommission !== undefined) {
                commissionAmount = (totalPrice * settings.platformCommission) / 100;
                hostRevenue = totalPrice - commissionAmount;
            }
        } catch (err) {
            console.error("Error fetching settings for commission:", err);
        }

        if (paymentMethod === "pay-at-site") {
            const booking = await Booking.create({
                user: req.user.id,
                listing: listingId,
                host: listing.owner,
                checkIn: checkIn,
                checkOut: checkOut,
                guest: guest,
                totalPrice: totalPrice,
                commissionAmount: commissionAmount,
                hostRevenue: hostRevenue,
                status: "pending"
            });

            return res.json({
                success: true,
                message: "Booking confirmed successfully. You can pay at the property.",
                booking
            });
        }

        const options = {
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        const booking = await Booking.create({
            user: req.user.id,
            listing: listingId,
            host: listing.owner,
            checkIn: checkIn,
            checkOut: checkOut,
            guest: guest,
            totalPrice: totalPrice,
            commissionAmount: commissionAmount,
            hostRevenue: hostRevenue,
            status: "pending"
        });

        res.json({
            success: true,
            booking,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to book"
        });
    }
};

module.exports.get = async (req, res) => {
    try {
        const booking = await Booking.find({ user: req.user.id }).populate("listing");
        if (booking.length === 0) {
            return res.json({
                message: "No bookings yet"
            });
        }
        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get booking"
        });
    }
};

module.exports.host = async (req, res) => {
    try {
        const bookings = await Booking.find({ host: req.user.id }).populate("listing user").sort({ createdAt: -1 });
        if (!bookings) {
            return res.json({
                message: "No bookings yet"
            })
        }
        res.json({
            success: true,
            total: bookings.length,
            bookings
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get all booking"
        });
    }
};

module.exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const booking = await Booking.findById(id).populate('listing');
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        const isHost = booking.host.equals(req.user._id);
        const isUser = booking.user.equals(req.user._id);

        if (!isHost && !isUser) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (isUser && !isHost) {
            if (status !== 'cancelled') {
                return res.json({ success: false, message: "Not authorized to change to this status" });
            }
            if (booking.status !== 'pending' && booking.status !== 'confirmed') {
                return res.json({ success: false, message: "Only pending or confirmed bookings can be canceled" });
            }
        }

        if (status === 'cancelled' && booking.paymentId && booking.refundStatus === 'none') {
            try {
                await razorpay.payments.refund(booking.paymentId);
                booking.refundStatus = "processed";
            } catch (err) {
                console.error("Razorpay refund error:", err);
                booking.refundStatus = "failed";
            }
        }

        booking.status = status;
        await booking.save();

        const listingTitle = booking.listing?.title || 'your listing';
        const notificationMessages = {
            confirmed: { user: `Your booking for "${listingTitle}" has been confirmed! `, host: null },
            cancelled: {
                user: isHost ? `Your booking for "${listingTitle}" was cancelled by the host.` : null,
                host: isUser && !isHost ? `A guest has cancelled their booking for "${listingTitle}".` : null,
            },
            completed: { user: `Your stay at "${listingTitle}" is now marked as completed. Thank you! `, host: null },
        };

        const msgs = notificationMessages[status];
        if (msgs) {
            const notifPromises = [];
            if (msgs.user) {
                notifPromises.push(Notification.create({ user: booking.user, title: 'Booking Update', message: msgs.user }));
            }
            if (msgs.host) {
                notifPromises.push(Notification.create({ user: booking.host, title: 'Booking Update', message: msgs.host }));
            }
            await Promise.all(notifPromises);
        }

        res.json({ success: true, message: `Booking ${status}`, booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};


module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        booking.status = "confirmed";
        booking.paymentId = razorpay_payment_id;
        await booking.save();

        res.json({
            success: true,
            message: "Payment verified, booking is now confirmed",
            booking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error during payment verification" });
    }
};

module.exports.adminGetAll = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate("listing", "title images").populate("user", "username email").sort({ createdAt: -1 });
        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch all bookings"
        });
    }
};

module.exports.adminDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.json({
                success: false,
                message: "Booking not found"
            });
        }
        await Booking.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete booking"
        });
    }
};