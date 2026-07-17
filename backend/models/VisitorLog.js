const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true
        },
        method: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        userAgent: {
            type: String
        },
        referer: {
            type: String
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        country: {
            type: String
        },
        region: {
            type: String
        },
        city: {
            type: String
        },
        timezone: {
            type: String
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("VisitorLog", visitorLogSchema);
