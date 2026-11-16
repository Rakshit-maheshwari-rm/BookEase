const mongoose = require("mongoose");
const aiService = require("../services/aiService");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const razorpay = require("../razorpay");
const Setting = require("../models/Setting");
const NodeCache = require("node-cache");

const itineraryCache = new NodeCache({ stdTTL: 86400, useClones: false });

module.exports.post = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { listingId, checkIn, checkOut, guest, paymentMethod } = req.body;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Check-in date cannot be in the past" });
        }
        if (checkOutDate <= checkInDate) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
        }

        const listing = await Listing.findById(listingId).session(session);
        if (!listing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const now = new Date();
        const overlappingBookings = await Booking.countDocuments({
            listing: listingId,
            $or: [
                { status: 'confirmed' },
                { status: 'pending', expiresAt: { $gt: now } }
            ],
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
        }).session(session);

        if (overlappingBookings >= (listing.inventory || 1)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                success: false,
                message: "This stay was just booked for these dates. Please choose different dates."
            });
        }

        const days = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
        const totalPrice = (days * listing.pricing.price) + (listing.pricing.serviceFee || 0) + (listing.pricing.cleaningFee || 0);

        let commissionAmount = 0;
        let hostRevenue = totalPrice;
        try {
            const settings = await Setting.findOne().session(session);
            if (settings && settings.platformCommission !== undefined) {
                commissionAmount = (totalPrice * settings.platformCommission) / 100;
                hostRevenue = totalPrice - commissionAmount;
            }
        } catch (err) {
            console.error("Error fetching settings for commission:", err);
        }

        const bookingPayload = {
            user: req.user.id,
            listing: listingId,
            host: listing.owner,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guest,
            totalPrice,
            commissionAmount,
            hostRevenue,
            status: "pending",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        };

        if (paymentMethod === "pay-at-site") {
            bookingPayload.status = "confirmed";
            bookingPayload.expiresAt = undefined;
            const [booking] = await Booking.create([bookingPayload], { session });
            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
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
        bookingPayload.orderId = order.id;
        const [booking] = await Booking.create([bookingPayload], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            booking,
            order
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Booking post error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create booking reservation"
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

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment verification parameters"
            });
        }

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        const isMatch = generatedSignature.length === razorpay_signature.length &&
            crypto.timingSafeEqual(Buffer.from(generatedSignature, "utf-8"), Buffer.from(razorpay_signature, "utf-8"));

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: invalid signature"
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = "confirmed";
        booking.paymentId = razorpay_payment_id;
        booking.expiresAt = undefined;
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

module.exports.getItinerary = async (req, res) => {
    try {
        const { id } = req.params;

        const isMongoId = mongoose.Types.ObjectId.isValid(id);
        let booking = null;
        if (isMongoId) {
            booking = await Booking.findById(id).populate("listing");
        }
        if (!booking) {
            booking = await Booking.findOne({ bookingId: id }).populate("listing");
        }

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const isGuest = booking.user.equals(req.user._id);
        const isHost = booking.host.equals(req.user._id);
        const isAdmin = req.user.role === "admin";

        if (!isGuest && !isHost && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking itinerary"
            });
        }

        const cacheKey = `itinerary_${booking._id.toString()}`;
        const cached = itineraryCache.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                cached: true,
                ...cached
            });
        }

        const itinerary = await aiService.generateItinerary({
            destination: booking?.listing?.city || booking?.listing?.country || "The destination",
            checkIn: booking?.checkIn ? booking.checkIn.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            checkOut: booking?.checkOut ? booking.checkOut.toISOString().split("T")[0] : new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
            guests: booking?.guest || 2,
            propertyTitle: booking?.listing?.title || "Vacation Stay",
            propertyType: booking?.listing?.type || "Villa",
        });

        const response = {
            bookingId: booking.bookingId || booking._id,
            propertyTitle: booking?.listing?.title,
            destination: booking?.listing?.city,
            itinerary
        };

        itineraryCache.set(cacheKey, response);

        return res.status(200).json({
            success: true,
            cached: false,
            ...response
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate itinerary"
        });
    }
};