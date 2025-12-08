import Complainer from "../models/complainerModel.js";
import { generateComplainerId } from "../utils/generateIds.js";

// CREATE Complainer
export const createComplainer = async (req, res) => {
    try {
        const { name, phone, taluka, village, address } = req.body;
        // Check if addedBy is provided, else use logged-in user
        const addedBy = req.body.addedBy || req.user?._id;

        if (!name || !taluka || !village) {
            return res.status(400).json({ message: "Name, Taluka, and Village are required" });
        }

        if (!addedBy) {
            return res.status(400).json({ message: "addedBy User ID is required" });
        }

        const complainerId = await generateComplainerId();

        const newComplainer = await Complainer.create({
            complainerId,
            name,
            phone,
            taluka,
            village,
            address,
            addedBy
        });

        res.status(201).json({ message: "Complainer created successfully", complainer: newComplainer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL Complainers
export const getAllComplainers = async (req, res) => {
    try {
        const complainers = await Complainer.find().populate("addedBy", "name phone");
        res.json(complainers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Single Complainer
export const getComplainerById = async (req, res) => {
    try {
        const { id } = req.params;
        const complainer = await Complainer.findById(id).populate("addedBy", "name phone");

        if (!complainer) return res.status(404).json({ message: "Complainer not found" });

        res.json(complainer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Complainers by AppUser (addedBy)
export const getComplainersByAppUser = async (req, res) => {
    try {
        const { userId } = req.params; // Assumes ObjectId
        const complainers = await Complainer.find({ addedBy: userId }).populate("addedBy", "name phone");

        res.json(complainers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Complainer
export const updateComplainer = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedComplainer = await Complainer.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedComplainer) return res.status(404).json({ message: "Complainer not found" });

        res.json({ message: "Complainer updated", complainer: updatedComplainer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE Complainer
export const deleteComplainer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComplainer = await Complainer.findByIdAndDelete(id);

        if (!deletedComplainer) return res.status(404).json({ message: "Complainer not found" });

        res.json({ message: "Complainer deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
