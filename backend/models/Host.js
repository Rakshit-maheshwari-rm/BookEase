const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HostSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "default.jpg",
    },
    description: {
        type: String,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 15,
        unique: true,
        sparse: true,
    },
    residentialAddress: {
        type: String,
    },
    emergencyName: {
        type: String,
    },
    emergencyRelation: {
        type: String,
    },
    emergencyPhone: {
        type: String,
        minlength: 10,
        maxlength: 12,
        unique: true,
        sparse: true,
    },
    bio: {
        type: String,
    },
    language: {
        type: String,
    },
    currency: {
        type: String,
    },
    idDocument: {
        type: String,
    },
    hasHostedBefore: {
        type: Boolean,
        default: false,
    },
    motivation: {
        type: String,
    },
    bankDetails: {
        accountHolderName: String,
        bankName: String,
        accountNumber: String,
        routingNumber: String,
    },
    idType: {
        type: String,
        enum: ["aadhaar", "passport", "pan", "driving_license", "voter_id"],
    },
    idNumber: {
        type: String,
    },
    idImage: {
        type: String,
    },
    agreedToTerms: {
        type: Boolean,
        required: true,
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
},
    {
        timestamps: true,
    });

module.exports = mongoose.model("Host", HostSchema);