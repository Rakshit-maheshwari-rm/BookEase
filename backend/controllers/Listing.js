const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const Rating = require("../models/Rating");

const attachRatings = async (listings) => {
  const listingIds = listings.map((l) => l._id);
  const allReviews = await Rating.find({ listing: { $in: listingIds } }).populate(
    "owner",
    "username createdAt image description"
  );

  const reviewsByListing = {};
  allReviews.forEach((review) => {
    const lid = review.listing.toString();
    if (!reviewsByListing[lid]) reviewsByListing[lid] = [];
    reviewsByListing[lid].push(review);
  });

  return listings.map((listing) => {
    const reviews = reviewsByListing[listing._id.toString()] || [];
    const totalRatings = reviews.length;
    const avgRating =
      totalRatings > 0
        ? Number(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        )
        : 0;
    return { ...listing.toObject(), reviews, avgRating, totalRatings };
  });
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports.create = async (req, res) => {
  const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  try {
    const files = req.files;

    if (!files?.mainImage) {
      return res.json({
        success: false,
        message: "Main image is required",
      });
    }

    let amenities = [];
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        if (typeof req.body.amenities === 'string') {
          amenities = [req.body.amenities];
        }
      }
    }

    const listing = new Listing({
      title: req.body.title,
      description: req.body.description,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      code: req.body.code,
      type: req.body.type,
      bedrooms: toNumber(req.body.bedrooms, 1),
      bathrooms: toNumber(req.body.bathrooms, 1),
      area: toNumber(req.body.area, 1),
      personsPerRoom: toNumber(req.body.personsPerRoom, 1),
      amenities,
      pricing: {
        price: toNumber(req.body.price, 1),
        discount: toNumber(req.body.discount, 0),
        serviceFee: toNumber(req.body.serviceFee, 0),
        cleaningFee: toNumber(req.body.cleaningFee, 0)
      },
      images: {
        mainImage: files.mainImage[0].path || files.mainImage[0].filename,
        gallery: files.gallery?.map((f) => f.path || f.filename) || [],
      },
      owner: req.user._id,
    });

    await listing.save();
    await Notification.create({
      user: req.user._id,
      title: "Listing",
      message: `Listing created successfully`,
    });
    res.json({
      success: true,
      message: "Listing Created Successfully",
      listing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create listing",
    });
  }
};

module.exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({
        success: false,
        message: "Listing not found",
      });
    }
    const result = await Listing.findById(id).populate("owner", "username email image");
    const reviews = await Rating.find({ listing: id }).populate("owner", "username image");
    res.json({
      success: true,
      message: "Data fetched successfully",
      result,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get listing data"
    });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    let list = {};
    if (req.body.list) {
      try {
        list = JSON.parse(req.body.list);
      } catch (e) {
        list = {};
      }
    } else {
      list = { ...req.body };
    }

    if (Object.keys(list).length === 0 && !req.files) {
      return res.json({
        success: false,
        message: "Listing data missing"
      });
    }

    delete list._id;
    delete list.owner;
    delete list.__v;
    delete list.createdAt;
    delete list.updatedAt;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "You are not owner of listing"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "address",
      "city",
      "state",
      "country",
      "code",
      "type",
      "amenities",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (list[field] !== undefined) {
        if (field === 'amenities' && typeof list[field] === 'string') {
          try {
            listing[field] = JSON.parse(list[field]);
          } catch (e) {
            listing[field] = [list[field]];
          }
        } else {
          listing[field] = list[field];
        }
      }
    });

    if (list.bedrooms !== undefined) listing.bedrooms = Number(list.bedrooms);
    if (list.bathrooms !== undefined) listing.bathrooms = Number(list.bathrooms);
    if (list.personsPerRoom !== undefined) listing.personsPerRoom = Number(list.personsPerRoom);
    if (list.area !== undefined) listing.area = Number(list.area);

    if (list.pricing) {
      if (typeof list.pricing === 'string') {
        try {
          const parsed = JSON.parse(list.pricing);
          listing.pricing = {
            price: Number(parsed.price) || listing.pricing.price,
            discount: Number(parsed.discount) || listing.pricing.discount,
          };
        } catch (e) { }
      } else if (list.pricing.price !== undefined) {
        listing.pricing = {
          price: Number(list.pricing.price),
          discount: Number(list.pricing.discount || listing.pricing.discount)
        };
      }
    } else if (list.price !== undefined) {
      listing.pricing = {
        price: Number(list.price),
        discount: Number(list.discount || listing.pricing.discount)
      };
    }

    const files = req.files;

    if (files?.mainImage) {
      if (!listing.images) listing.images = {};
      listing.images.mainImage = files.mainImage[0].path || files.mainImage[0].filename;
    }

    if (files?.gallery && files.gallery.length > 0) {
      if (!listing.images) listing.images = {};
      listing.images.gallery = files.gallery.map((f) => f.path || f.filename);
    }

    await listing.save();
    await Notification.create({
      user: listing.owner,
      title: "Listing",
      message: `Your listing "${listing.title}" was updated`,
    });
    res.json({
      success: true,
      message: "Listing updated successfully",
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update listing"
    });
  }
};

module.exports.all = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const result = await Listing.find({}).limit(limit).populate("owner", "username image");
    const listingsWithRating = await attachRatings(result);
    res.json({
      success: true,
      count: listingsWithRating.length,
      listing: listingsWithRating,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get all listings",
    });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found"
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "You are not the owner of this listing"
      });
    }

    await Listing.findByIdAndDelete(id);
    await Rating.deleteMany({ listing: id });
    await Notification.create({
      user: listing.owner,
      title: "Listing",
      message: `Listing deleted successfully`,
    });
    res.json({
      success: true,
      message: `Your listing "${listing.title}" was deleted`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete listing"
    });
  }
};

module.exports.search = async (req, res) => {
  try {
    const { location, type, priceRange, minGuests } = req.query;

    let filter = {};

    if (location) {
      const safeLocation = escapeRegex(location);
      filter.$or = [
        { city: { $regex: safeLocation, $options: "i" } },
        { state: { $regex: safeLocation, $options: "i" } },
        { country: { $regex: safeLocation, $options: "i" } },
        { address: { $regex: safeLocation, $options: "i" } },
        { title: { $regex: safeLocation, $options: "i" } }
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (minGuests && !isNaN(Number(minGuests))) {
      filter.personsPerRoom = { $gte: Number(minGuests) };
    }

    if (priceRange) {
      if (priceRange === "above20001") {
        filter['pricing.price'] = { $gt: 20000 };
      } else {
        const [min, max] = priceRange.split('-');
        if (min !== undefined && max !== undefined) {
          const parsedMin = Number(min);
          const parsedMax = Number(max);
          if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
            filter['pricing.price'] = { $gte: parsedMin, $lte: parsedMax };
          }
        }
      }
    }

    const listings = await Listing.find(filter).populate("owner", "username image");
    const listingsWithRating = await attachRatings(listings);
    res.json({
      success: true,
      listings: listingsWithRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports.explore = async (req, res) => {
  try {
    const { location, type, priceRange, amenities } = req.query;

    let filter = {};

    if (location) {
      const safeLocation = escapeRegex(location);
      filter.$or = [
        { city: { $regex: safeLocation, $options: "i" } },
        { state: { $regex: safeLocation, $options: "i" } },
        { country: { $regex: safeLocation, $options: "i" } },
        { address: { $regex: safeLocation, $options: "i" } },
        { title: { $regex: safeLocation, $options: "i" } }
      ];
    }

    if (type) {
      const typesArray = type.split(',').map(t => t.trim());
      filter.type = { $in: typesArray };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }

    if (priceRange) {
      if (priceRange === "above20001") {
        filter['pricing.price'] = { $gt: 20000 };
      } else {
        const [min, max] = priceRange.split('-');
        if (min !== undefined && max !== undefined) {
          const parsedMin = Number(min);
          const parsedMax = Number(max);
          if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
            filter['pricing.price'] = { $gte: parsedMin, $lte: parsedMax };
          }
        }
      }
    }

    const listings = await Listing.find(filter).populate("owner", "username image");
    const listingsWithRating = await attachRatings(listings);
    res.json({
      success: true,
      listings: listingsWithRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports.destinationFinder = async (req, res) => {
  try {
    const { location, type, maxPrice, minGuests } = req.query;

    let filter = {};

    if (location) {
      const safeLocation = escapeRegex(location);
      filter.$or = [
        { city: { $regex: safeLocation, $options: "i" } },
        { state: { $regex: safeLocation, $options: "i" } },
        { country: { $regex: safeLocation, $options: "i" } },
        { title: { $regex: safeLocation, $options: "i" } }
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter['pricing.price'] = { $lte: Number(maxPrice) };
    }

    if (minGuests && !isNaN(Number(minGuests))) {
      filter.personsPerRoom = { $gte: Number(minGuests) };
    }
    const matchedListings = await Listing.find(filter).populate("owner", "username image");
    const listingsWithRating = await attachRatings(matchedListings);
    listingsWithRating.sort((a, b) => b.avgRating - a.avgRating);
    const top5Listings = listingsWithRating.slice(0, 5);
    res.json({
      success: true,
      count: top5Listings.length,
      listings: top5Listings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while finding destinations",
    });
  }
};

module.exports.getHostListing = async (req, res) => {
  try {
    const user = req.user;
    const listing = await Listing.find({ owner: user._id });
    res.json({
      success: true,
      message: "Successfully fetched details",
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching details",
    });
  }
};

module.exports.hostDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found"
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "You are not the owner of this listing"
      });
    }

    await Listing.findByIdAndDelete(id);
    await Rating.deleteMany({ listing: id });
    await Notification.create({
      user: listing.owner,
      title: "Listing",
      message: `Listing deleted successfully`,
    });
    res.json({
      success: true,
      message: `Your listing "${listing.title}" was deleted`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting",
    });
  }
};

module.exports.adminGetAll = async (req, res) => {
  try {
    const listings = await Listing.find({}).populate("owner", "username email").sort({ createdAt: -1 });
    res.json({
      success: true,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching all listings",
    });
  }
};

module.exports.adminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found"
      });
    }

    listing.isActive = isActive;
    await listing.save();
    await Notification.create({
      user: listing.owner,
      title: "Listing",
      message: `Your listing "${listing.title}" was updated`,
    });
    res.json({
      success: true,
      message: `Listing status updated to ${isActive ? 'Active' : 'Inactive'}`,
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating listing status",
    });
  }
};

module.exports.adminDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.json({
        success: false,
        message: "Listing not found"
      });
    }

    await Listing.findByIdAndDelete(id);
    await Rating.deleteMany({ listing: id });
    await Notification.create({
      user: listing.owner,
      title: "Listing",
      message: `Your listing "${listing.title}" was deleted`,
    });
    res.json({
      success: true,
      message: "Listing deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting listing",
    });
  }
};

