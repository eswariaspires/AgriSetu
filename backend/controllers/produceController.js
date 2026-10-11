
import mongoose from "mongoose";
import Produce from "../models/produce.js";

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 1024 * 1024; // 1 MB per image
const MAX_TOTAL_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB total

const validateImages = (images) => {
  if (images === undefined) {
    return { valid: true, images: [] };
  }

  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return {
      valid: false,
      message: "You can upload up to five photos.",
    };
  }

  let totalBytes = 0;

  for (const image of images) {
    if (typeof image !== "string") {
      return { valid: false, message: "Invalid image data." };
    }

    const match = image.match(
      /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/
    );

    if (!match) {
      return {
        valid: false,
        message: "Use JPG, PNG, or WebP images only.",
      };
    }

    const base64 = match[2];
    const bytes = Math.floor((base64.length * 3) / 4)
      - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

    if (bytes > MAX_IMAGE_BYTES) {
      return {
        valid: false,
        message: "Each photo must be 1 MB or smaller.",
      };
    }

    totalBytes += bytes;
  }

  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
    return {
      valid: false,
      message: "The combined size of photos must be 5 MB or smaller.",
    };
  }

  return { valid: true, images };
};
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
      images,
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

    if (
      quality !== undefined &&
      !["Grade A", "Grade B", "Grade C", "Not sure"].includes(quality)
    ) {
      return res.status(400).json({
        message: "Please select a valid quality grade.",
      });
    }

    const imageCheck = validateImages(images);

    if (!imageCheck.valid) {
      return res.status(400).json({
        message: imageCheck.message,
      });
    }

    const produce = await Produce.create({
      farmerId: req.user.id,
      crop: crop.trim(),
      quantity: Number(quantity),
      unit,
      quality: quality || "Not sure",
      date,
      district: district.trim(),
      state: state.trim(),
      description: description || "",
      images: imageCheck.images,
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

    const existing = await Produce.findOne({
      _id: req.params.id,
      farmerId: req.user.id,
    });

    if (!existing) {
      return res.status(404).json({
        message: "Produce listing not found.",
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

    if (
      updates.crop !== undefined &&
      !String(updates.crop).trim()
    ) {
      return res.status(400).json({
        message: "Crop name is required.",
      });
    }

    if (
      updates.quantity !== undefined &&
      !(Number(updates.quantity) > 0)
    ) {
      return res.status(400).json({
        message: "Quantity must be greater than zero.",
      });
    }

    if (
      updates.unit !== undefined &&
      !["kg", "quintal", "ton"].includes(updates.unit)
    ) {
      return res.status(400).json({
        message: "Invalid quantity unit.",
      });
    }

    if (
      updates.quality !== undefined &&
      !["Grade A", "Grade B", "Grade C", "Not sure"].includes(
        updates.quality
      )
    ) {
      return res.status(400).json({
        message: "Invalid quality grade.",
      });
    }

    if (updates.crop !== undefined) {
      updates.crop = String(updates.crop).trim();
    }

    if (updates.quantity !== undefined) {
      updates.quantity = Number(updates.quantity);
    }

    if (updates.district !== undefined) {
      updates.district = String(updates.district).trim();
    }

    if (updates.state !== undefined) {
      updates.state = String(updates.state).trim();
    }

    if (req.body.images !== undefined) {
      const imageCheck = validateImages(req.body.images);

      if (!imageCheck.valid) {
        return res.status(400).json({
          message: imageCheck.message,
        });
      }

      updates.images = imageCheck.images;
    }

    const produce = await Produce.findOneAndUpdate(
      {
        _id: req.params.id,
        farmerId: req.user.id,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({ produce });
  } catch (error) {
    console.error("Update produce error:", error);

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