
import mongoose from "mongoose";
import Connection from "../models/connection.js";
import User from "../models/user.js";
import { protect } from "../middleware/authMiddleware.js";

export const createConnection = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can send requests.",
      });
    }

    const { farmerId, produceId } = req.body;

    if (
      !mongoose.isValidObjectId(farmerId) ||
      !produceId
    ) {
      return res.status(400).json({
        message: "Valid farmer and produce IDs are required.",
      });
    }

    const farmer = await User.findOne({
      _id: farmerId,
      role: "farmer",
    });

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found.",
      });
    }

    const connection = await Connection.findOneAndUpdate(
      {
        buyerId: req.user.id,
        produceId,
      },
      {
        $setOnInsert: {
          buyerId: req.user.id,
          farmerId,
          produceId,
          status: "pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (connection.farmerId.toString() !== farmerId) {
      return res.status(409).json({
        message: "This produce already has a request for another farmer.",
      });
    }

    return res.status(200).json({ connection });
  } catch (error) {
    console.error("Create connection error:", error.message);
    return res.status(500).json({
      message: "Unable to create connection.",
    });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const filter =
      req.user.role === "buyer"
        ? { buyerId: req.user.id }
        : { farmerId: req.user.id };

    const connections = await Connection.find(filter)
      .populate("buyerId", "name")
      .populate("farmerId", "name")
      .lean();

    const results = await Promise.all(
      connections.map(async (connection) => {
        const isBuyer = req.user.role === "buyer";
        const otherUserId = isBuyer
          ? connection.farmerId?._id
          : connection.buyerId?._id;

        const canSeeContact = isBuyer
          ? connection.status === "accepted"
          : true;

        let contact = null;

        if (canSeeContact && otherUserId) {
          contact = await User.findById(otherUserId)
            .select("name email phone district state")
            .lean();
        }

        return {
          id: connection._id,
          buyerId: connection.buyerId?._id,
          farmerId: connection.farmerId?._id,
          produceId: connection.produceId,
          status: connection.status,
          otherUser: contact,
        };
      })
    );

    return res.json({ connections: results });
  } catch (error) {
    console.error("Get connections error:", error);
    return res.status(500).json({
      message: "Unable to fetch connections.",
    });
  }
};

export const updateConnectionStatus = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update requests.",
      });
    }

    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid connection status.",
      });
    }

    const connection = await Connection.findOneAndUpdate(
      {
        _id: req.params.id,
        farmerId: req.user.id,
        status: "pending",
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!connection) {
      return res.status(404).json({
        message: "Pending request not found.",
      });
    }

    return res.json({
      message: `Request ${status}.`,
      connection,
    });
  } catch (error) {
    console.error("Update connection error:", error.message);
    return res.status(500).json({
      message: "Unable to update request.",
    });
  }
};

