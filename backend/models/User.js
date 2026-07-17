const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "host", "admin"],
    default: "user"
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 15,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ["active", "banned"],
    default: "active"
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

  address: {
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    pinCode: {
      type: String,
      minlength: 6,
      maxlength: 6,
    }
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
  idType: {
    type: String,
    enum: ["aadhaar", "passport", "pan", "driving_license", "voter_id"],
  },
  idNumber: {
    type: String,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
  }]
},
  {
    timestamps: true,
  });

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model("User", UserSchema);