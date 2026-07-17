const passport = require("passport");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");
const Rating = require("../models/Rating");
const Listing = require("../models/Listing");

module.exports.signup = async (req, res) => {
  try {
    const { email, username, password, role, phone } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "All fields are required" });

    let image;

    if (req.file && (req.file.path || req.file.filename)) {
      image = req.file.path || req.file.filename;
    }

    const user = new User({ email, username, role, phone, image });
    const newUser = await User.register(user, password);

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ error: "Login after signup failed" });
      res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          phone: newUser.phone,
          image: newUser.image,
          description: newUser.description,
          dob: newUser.dob,
          gender: newUser.gender,
          address: newUser.address,
          emergencyName: newUser.emergencyName,
          emergencyRelation: newUser.emergencyRelation,
          emergencyPhone: newUser.emergencyPhone,
          bio: newUser.bio,
          language: newUser.language,
          currency: newUser.currency,
          idType: newUser.idType,
          idNumber: newUser.idNumber,
        },
      });
    });
  } catch (err) {
    if (err.name === "UserExistsError")
      return res.status(409).json({ error: "Email or username already exists" });
    res.status(500).json({ error: "Signup failed" });
  }
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ error: "Authentication error" });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          image: user.image,
          description: user.description,
          dob: user.dob,
          gender: user.gender,
          address: user.address,
          emergencyName: user.emergencyName,
          emergencyRelation: user.emergencyRelation,
          emergencyPhone: user.emergencyPhone,
          bio: user.bio,
          language: user.language,
          currency: user.currency,
          idType: user.idType,
          idNumber: user.idNumber,
        },
      });
    });
  })(req, res, next);
};


module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
};

module.exports.checkUser = async (req, res) => {
  if (!req.isAuthenticated()) return res.json({ loggedIn: false });

  try {
    const user = await User.findById(req.user._id).populate('favorites');

    const listingIds = user.favorites.map(f => f._id);
    const allReviews = await Rating.find({ listing: { $in: listingIds } }).populate("owner", "username createdAt image description");

    const reviewsByListing = {};
    allReviews.forEach(review => {
      const lid = review.listing.toString();
      if (!reviewsByListing[lid]) reviewsByListing[lid] = [];
      reviewsByListing[lid].push(review);
    });

    const favoritesWithRating = user.favorites.map((listing) => {
      const reviews = reviewsByListing[listing._id.toString()] || [];
      const totalRatings = reviews.length;
      const avgRating =
        totalRatings > 0
          ? (
            reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / totalRatings
          ).toFixed(1)
          : 0;

      return {
        ...listing.toObject(),
        reviews,
        avgRating: Number(avgRating),
        totalRatings,
      };
    });

    const totalBookings = await Booking.countDocuments({ user: user._id });
    const totalReviews = await Rating.countDocuments({ owner: user._id });
    const totalNotifications = await Notification.countDocuments({ user: user._id });

    res.json({
      loggedIn: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        image: user.image,
        description: user.description,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        emergencyName: user.emergencyName,
        emergencyRelation: user.emergencyRelation,
        emergencyPhone: user.emergencyPhone,
        bio: user.bio,
        language: user.language,
        currency: user.currency,
        idType: user.idType,
        idNumber: user.idNumber,
        favorites: favoritesWithRating,
        totalBookings,
        totalReviews,
        totalNotifications,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    const user = req.user;
    res.json({
      loggedIn: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        image: user.image,
        description: user.description,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        emergencyName: user.emergencyName,
        emergencyRelation: user.emergencyRelation,
        emergencyPhone: user.emergencyPhone,
        bio: user.bio,
        language: user.language,
        currency: user.currency,
        idType: user.idType,
        idNumber: user.idNumber,
        favorites: user.favorites,
      },
    });
  }
};


module.exports.update = async (req, res) => {
  try {
    const id = req.user._id;
    const { email, username, password, role, phone, description, dob, gender, address, emergencyName, emergencyRelation, emergencyPhone, bio, language, currency, idType, idNumber } = req.body;
    const image = req.file ? (req.file.path || req.file.filename) : null;

    const user = await User.findById(id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    let changes = [];

    if (email && email !== user.email) {
      user.email = email;
      changes.push("Email changed successfully");
    }

    if (username && username !== user.username) {
      user.username = username;
      changes.push("Username changed successfully");
    }

    if (phone && phone !== user.phone) {
      user.phone = phone;
      changes.push("Phone changed successfully");
    }

    if (description && description !== user.description) {
      user.description = description;
      changes.push("Description changed successfully");
    }

    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address) {
      if (!user.address) user.address = {};
      if (address.street !== undefined) user.address.street = address.street;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.state !== undefined) user.address.state = address.state;
      if (address.country !== undefined) user.address.country = address.country;
      if (address.pinCode !== undefined) user.address.pinCode = address.pinCode;
    }
    if (emergencyName) user.emergencyName = emergencyName;
    if (emergencyRelation) user.emergencyRelation = emergencyRelation;
    if (emergencyPhone) user.emergencyPhone = emergencyPhone;
    if (bio) user.bio = bio;
    if (language) user.language = language;
    if (currency) user.currency = currency;
    if (idType) user.idType = idType;
    if (idNumber) user.idNumber = idNumber;

    if (password && password.trim() !== "") {
      if (!req.body.currentPassword) {
        return res.json({
          success: false,
          message: "Current password is required"
        });
      }
      const { user: authenticated } = await user.authenticate(req.body.currentPassword);
      if (!authenticated) {
        return res.json({
          success: false,
          message: "Current password is incorrect"
        });
      }
      await user.setPassword(password);
      changes.push("Password changed successfully");
    }

    if (image) {
      user.image = image;
      changes.push("Profile image changed successfully");
    }

    await user.save();

    if (changes.length > 0) {
      await Notification.create({
        user: id,
        title: "Profile Updated",
        message: changes.join(", ")
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        image: user.image,
        description: user.description,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        emergencyName: user.emergencyName,
        emergencyRelation: user.emergencyRelation,
        emergencyPhone: user.emergencyPhone,
        bio: user.bio,
        language: user.language,
        currency: user.currency,
        idType: user.idType,
        idNumber: user.idNumber,
        favorites: user.favorites,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports.addToFavorites = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found",
      });
    }
    const isFavorite = user.favorites.some(fav => fav.toString() === id);
    if (isFavorite) {
      user.favorites = user.favorites.filter(item => item.toString() !== id);
      await user.save();
      return res.json({
        success: true,
        message: "Listing removed from favorites",
      });
    }
    user.favorites.push(id);
    await user.save();
    return res.json({
      success: true,
      message: "Listing added in favorites",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports.removeFromFavorites = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found",
      });
    }
    if (!user.favorites.includes(id)) {
      return res.json({
        success: false,
        message: "Listing not added in favorites",
      });
    }
    if (user.favorites.includes(id)) {
      user.favorites = user.favorites.filter(item => item.toString() !== id);
      await user.save();
      return res.json({
        success: true,
        message: "Listing removed from favorites",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports.dashboardStats = async (req, res) => {

  try {
    const user = req.user;
    const listing = await Listing.find({ owner: user._id });

    const activeListing = listing.filter(item => item.isActive === true).length;

    const booking = await Booking.find({ host: user._id });
    const totalBooking = booking.length;
    const actBooking = booking.filter(item => item.status === 'confirmed').length;

    let totalRevenue = 0;
    let pendingPayouts = 0;

    booking.forEach(item => {
      if (item.status === 'confirmed') {
        totalRevenue += (item.totalPrice || 0);
      } else if (item.status === 'pending') {
        pendingPayouts += (item.totalPrice || 0);
      }
    });

    const allListingIds = listing.map(item => item._id);
    const rating = await Rating.find({ listing: { $in: allListingIds } });
    const totalRating = rating.length;

    return res.json({
      success: true,
      message: "Stats fetched successfully",
      totalRevenue,
      pendingPayouts,
      actBooking,
      activeListing,
      totalBooking,
      totalRating
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }, '-hash -salt').sort({ createdAt: -1 });
    return res.json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong fetching users"
    });
  }
};

module.exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    user.status = status;
    await user.save();

    return res.json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong updating user status"
    });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userListings = await Listing.find({ owner: id });
    const listingIds = userListings.map(listing => listing._id);

    await Rating.deleteMany({ $or: [{ owner: id }, { listing: { $in: listingIds } }] });

    await Booking.deleteMany({ $or: [{ user: id }, { host: id }] });

    await Listing.deleteMany({ owner: id });

    await Notification.deleteMany({ user: id });

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong deleting user"
    });
  }
};