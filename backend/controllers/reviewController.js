import mongoose from "mongoose";
import Review from "../models/Review.js";
import Connection from "../models/connection.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const isValidRating = (value) =>
Number.isInteger(value) && value >= 1 && value <= 5;

// POST /api/reviews
export const createReview = async (req, res) => {
try {
const buyerId = getUserId(req);


if (!buyerId || !mongoose.isValidObjectId(buyerId)) {
  return res.status(401).json({ message: "Authentication required." });
}

if (req.user.role !== "buyer") {
  return res.status(403).json({
    message: "Only buyers can submit reviews.",
  });
}

const {
  connectionId,
  qualityRating,
  serviceRating,
  overallRating,
  comment = "",
} = req.body;

if (!mongoose.isValidObjectId(connectionId)) {
  return res.status(400).json({ message: "Invalid connection ID." });
}

if (
  !isValidRating(qualityRating) ||
  !isValidRating(serviceRating) ||
  !isValidRating(overallRating)
) {
  return res.status(400).json({
    message: "All ratings must be whole numbers from 1 to 5.",
  });
}

if (typeof comment !== "string" || comment.length > 1000) {
  return res.status(400).json({
    message: "Comment must be 1000 characters or fewer.",
  });
}

const connection = await Connection.findOne({
  _id: connectionId,
  buyerId,
  status: "accepted",
});

if (!connection) {
  return res.status(403).json({
    message: "You can review only a produce connection accepted by you.",
  });
}

const existingReview = await Review.findOne({ connectionId });

if (existingReview) {
  return res.status(409).json({
    message: "You have already reviewed this connection.",
  });
}

const review = await Review.create({
  connectionId,
  buyerId,
  farmerId: connection.farmerId,
  produceId: connection.produceId,
  qualityRating,
  serviceRating,
  overallRating,
  comment: comment.trim(),
});

return res.status(201).json({
  message: "Review published successfully.",
  review,
});


} catch (error) {
if (error.code === 11000) {
return res.status(409).json({
message: "This connection has already been reviewed.",
});
}


console.error("Create review error:", error.message);
return res.status(500).json({ message: "Unable to submit review." });


}
};

// GET /api/reviews/farmer/:farmerId
export const getFarmerReviews = async (req, res) => {
try {
const { farmerId } = req.params;


if (!mongoose.isValidObjectId(farmerId)) {
  return res.status(400).json({ message: "Invalid farmer ID." });
}

const reviews = await Review.find({ farmerId })
  .populate("buyerId", "name")
  .sort({ createdAt: -1 })
  .lean();

const count = reviews.length;

const averageRating = count
  ? Number(
      (
        reviews.reduce((sum, review) => sum + review.overallRating, 0) /
        count
      ).toFixed(1)
    )
  : 0;

return res.json({
  averageRating,
  reviewCount: count,
  reviews: reviews.map((review) => ({
    ...review,
    buyerName: review.buyerId?.name || "Buyer",
  })),
});


} catch (error) {
console.error("Get farmer reviews error:", error.message);
return res.status(500).json({ message: "Unable to load reviews." });
}
};

// GET /api/reviews/produce/:produceId
export const getProduceReviews = async (req, res) => {
try {
const reviews = await Review.find({ produceId: req.params.produceId })
.populate("buyerId", "name")
.sort({ createdAt: -1 })
.lean();


return res.json({
  reviews: reviews.map((review) => ({
    ...review,
    buyerName: review.buyerId?.name || "Buyer",
  })),
});


} catch (error) {
console.error("Get produce reviews error:", error.message);
return res.status(500).json({ message: "Unable to load reviews." });
}
};

// GET /api/reviews/mine
export const getMyReviews = async (req, res) => {
try {
const buyerId = req.user?._id || req.user?.id;


if (!buyerId) {
  return res.status(401).json({
    message: "Authentication required.",
  });
}

const reviews = await Review.find({
  buyerId: buyerId,
}).lean().exec();

return res.status(200).json({
  reviews: reviews,
});


} catch (error) {
console.error("Get my reviews error:", error);
return res.status(500).json({
message: "Unable to load your reviews.",
});
}
};

