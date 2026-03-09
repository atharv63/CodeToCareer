const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const Municipality = require("../models/Municipality");
const City = require("../models/City");
const Department = require("../models/Department");
require("../models/User");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatUser = (user) => {
  if (!user || typeof user !== "object") return null;
  const id = user._id?.toString?.() || user._id || user.id || null;

  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
  };
};

const formatComplaint = (complaintDoc) => {
  const complaint = complaintDoc.toObject
    ? complaintDoc.toObject()
    : complaintDoc;
  const id =
    complaint._id?.toString?.() || complaint._id || complaint.id || null;

  const userId =
    complaint.userId &&
    typeof complaint.userId === "object" &&
    complaint.userId._id
      ? complaint.userId._id.toString()
      : complaint.userId?.toString?.() || complaint.userId || null;

  const municipalityId =
    complaint.municipalityId &&
    typeof complaint.municipalityId === "object" &&
    complaint.municipalityId._id
      ? complaint.municipalityId._id.toString()
      : complaint.municipalityId?.toString?.() ||
        complaint.municipalityId ||
        null;

  const cityId =
    complaint.cityId && typeof complaint.cityId === "object" && complaint.cityId._id
      ? complaint.cityId._id.toString()
      : complaint.cityId?.toString?.() || complaint.cityId || null;

  const city =
    complaint.cityId && typeof complaint.cityId === "object" && complaint.cityId.name
      ? complaint.cityId.name
      : complaint.municipalityId &&
          typeof complaint.municipalityId === "object" &&
          complaint.municipalityId.cityId &&
          typeof complaint.municipalityId.cityId === "object" &&
          complaint.municipalityId.cityId.name
        ? complaint.municipalityId.cityId.name
        : "";

  return {
    ...complaint,
    id,
    _id: id,
    userId,
    cityId,
    city,
    municipalityId,
    user: formatUser(complaint.userId),
  };
};

const formatMunicipality = (municipalityDoc) => {
  const municipality = municipalityDoc.toObject
    ? municipalityDoc.toObject()
    : municipalityDoc;
  const id =
    municipality._id?.toString?.() ||
    municipality._id ||
    municipality.id ||
    null;

  const cityId =
    municipality.cityId &&
    typeof municipality.cityId === "object" &&
    municipality.cityId._id
      ? municipality.cityId._id.toString()
      : municipality.cityId?.toString?.() || municipality.cityId || null;

  const city =
    municipality.cityId &&
    typeof municipality.cityId === "object" &&
    municipality.cityId.name
      ? municipality.cityId.name
      : municipality.city || "";

  return {
    ...municipality,
    id,
    _id: id,
    cityId,
    city,
  };
};

/*
--------------------------------
1. VIEW ALL COMPLAINTS
--------------------------------
*/

exports.getAllComplaints = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const complaints = await Complaint.find(filter)
      .populate("userId", "name email")
      .populate("cityId", "name")
      .populate({
        path: "municipalityId",
        select: "name cityId",
        populate: { path: "cityId", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json(complaints.map(formatComplaint));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
2. VIEW SINGLE COMPLAINT
--------------------------------
*/

exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findById(id)
      .populate("userId", "name email")
      .populate("cityId", "name")
      .populate({
        path: "municipalityId",
        select: "name cityId",
        populate: { path: "cityId", select: "name" },
      });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(formatComplaint(complaint));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
3. ASSIGN COMPLAINT TO MUNICIPALITY
--------------------------------
*/

exports.assignComplaint = async (req, res) => {
  try {
    const { complaintId, municipalityId } = req.body;

    if (!complaintId || !municipalityId) {
      return res
        .status(400)
        .json({ message: "complaintId and municipalityId are required" });
    }

    if (!isValidObjectId(complaintId) || !isValidObjectId(municipalityId)) {
      return res
        .status(400)
        .json({ message: "Invalid complaintId or municipalityId" });
    }

    const municipality =
      await Municipality.findById(municipalityId).select("_id cityId");
    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        municipalityId: municipality._id,
        cityId: municipality.cityId,
        status: "Assigned",
      },
      { returnDocument: "after" },
    )
      .populate("userId", "name email")
      .populate("cityId", "name")
      .populate({
        path: "municipalityId",
        select: "name cityId",
        populate: { path: "cityId", select: "name" },
      });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint assigned successfully",
      complaint: formatComplaint(complaint),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
4. MARK COMPLAINT AS SPAM
--------------------------------
*/

exports.markSpam = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status: "Spam" },
      { returnDocument: "after" },
    )
      .populate("userId", "name email")
      .populate("cityId", "name")
      .populate({
        path: "municipalityId",
        select: "name cityId",
        populate: { path: "cityId", select: "name" },
      });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint marked as spam",
      complaint: formatComplaint(complaint),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
5. DELETE COMPLAINT
--------------------------------
*/

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
6. CREATE MUNICIPALITY
--------------------------------
*/

exports.createMunicipality = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const city = typeof req.body.city === "string" ? req.body.city.trim() : "";

    if (!name || !city) {
      return res.status(400).json({ message: "name and city are required" });
    }

    const nameRegex = new RegExp(`^${escapeRegex(name)}$`, "i");
    const cityRegex = new RegExp(`^${escapeRegex(city)}$`, "i");

    const existingMunicipality = await Municipality.findOne({
      name: nameRegex,
    });
    if (existingMunicipality) {
      return res.status(409).json({ message: "Municipality already exists" });
    }

    let cityDoc = await City.findOne({ name: cityRegex });
    if (!cityDoc) {
      cityDoc = await City.create({ name: city });
    }

    const municipality = await Municipality.create({
      name,
      cityId: cityDoc._id,
      departments: [],
    });

    await City.findByIdAndUpdate(cityDoc._id, {
      $addToSet: { municipalities: municipality._id },
    });

    const populatedMunicipality = await Municipality.findById(
      municipality._id,
    ).populate("cityId", "name");

    res.status(201).json(formatMunicipality(populatedMunicipality));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
7. GET ALL MUNICIPALITIES
--------------------------------
*/

exports.getMunicipalities = async (req, res) => {
  try {
    const municipalities = await Municipality.find()
      .populate("cityId", "name")
      .sort({ createdAt: -1 });

    res.json(municipalities.map(formatMunicipality));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
--------------------------------
8. DELETE MUNICIPALITY
--------------------------------
*/

exports.deleteMunicipality = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid municipality id" });
    }

    const municipality = await Municipality.findByIdAndDelete(id);
    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    await City.findByIdAndUpdate(municipality.cityId, {
      $pull: { municipalities: municipality._id },
    });

    await Department.deleteMany({ municipalityId: municipality._id });

    res.json({
      message: "Municipality deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
