const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
    message:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        min: 1,
        max: 5,
        default:1,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Rating',RatingSchema);