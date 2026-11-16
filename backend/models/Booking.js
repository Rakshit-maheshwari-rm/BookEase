const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    guest: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    commissionAmount: {
        type: Number,
        default: 0,
    },
    hostRevenue: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    orderId: {
        type: String,
        default: null,
        index: true,
    },
    paymentId: {
        type: String,
        default: null
    },
    refundStatus: {
        type: String,
        enum: ["none", "processed", "failed"],
        default: "none"
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 15 * 60 * 1000),
        index: { expires: '0s', partialFilterExpression: { status: 'pending' } }
    }
}, { timestamps: true }
);

bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ host: 1, createdAt: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });

bookingSchema.pre('validate', function () {
    if (!this.bookingId) {
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.bookingId = `BK-${randomStr}`;
    }
});

module.exports = mongoose.model('Booking', bookingSchema);