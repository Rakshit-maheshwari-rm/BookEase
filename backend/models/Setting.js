const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
    platformCommission: {
        type: Number,
        default: 10,
    },
    minWithdrawalAmount: {
        type: Number,
        default: 50,
    },
    supportEmail: {
        type: String,
        default: "support@bookease.com",
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    appVersion: {
        type: String,
        default: "v1.0.0",
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
