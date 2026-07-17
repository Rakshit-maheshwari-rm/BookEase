const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
    withdrawalId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },

    holderName: {
        type: String,
        required: true
    },

    bankName: {
        type: String,
        required: true
    },

    accountNumber: {
        type: String,
        required: true
    },

    ifsc: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);