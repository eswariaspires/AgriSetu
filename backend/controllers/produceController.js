
import mongoose from "mongoose";
import Produce from "../models/produce.js";

export const getProduce = async (req, res) => {
  try {
    const produce = await Produce.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ produce });
  } catch (error) {
    console.error("Get produce error:", error);
    return res.status(500).json({
      message: "Unable to fetch produce listings.",
    });
  }
};

export const createProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can add produce.",
      });
    }

    const {
      crop,
      quantity,
      unit,
      quality,
      date,
      district,
      state,
      description,
    } = req.body;

    if (
      !crop?.trim() ||
      !(Number(quantity) > 0) ||
      !["kg", "quintal", "ton"].includes(unit) ||
      !date ||
      !district?.trim() ||
      !state?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide valid produce details.",
      });
    }

    const produce = await Produce.create({
      farmerId: req.user.id,
      crop: crop.trim(),
      quantity: Number(quantity),
      unit,
      quality,
      date,
      district: district.trim(),
      state: state.trim(),
      description,
    });

    return res.status(201).json({ produce });
  } catch (error) {
    console.error("Create produce error:", error);
    return res.status(500).json({
      message: "Unable to add produce.",
    });
  }
};

export const updateProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can update produce.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid produce ID.",
      });
    }

    const allowedFields = [
      "crop",
      "quantity",
      "unit",
      "quality",
      "date",
      "district",
      "state",
      "description",
      "status",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const produce = await Produce.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!produce) {
      return res.status(404).json({
        message: "Produce listing not found.",
      });
    }

    return res.json({ produce });
  } catch (error) {
    console.error("Update produce error:", error.message);
    return res.status(500).json({
      message: "Unable to update produce.",
    });
  }
};

export const deleteProduce = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        message: "Only farmers can delete produce.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid produce ID.",
      });
    }

    const produce = await Produce.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user.id,
    });

    if (!produce) {
      return res.status(404).json({
        message: "Produce listing not found.",
      });
    }

    return res.json({
      message: "Produce deleted successfully.",
    });
  } catch (error) {
    console.error("Delete produce error:", error.message);
    return res.status(500).json({
      message: "Unable to delete produce.",
    });
  }
};