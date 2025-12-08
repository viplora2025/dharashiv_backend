import SubDepartment from "../models/subDepartmentModel.js";
import Department from "../models/departmentModel.js";
import { generateSubDeptId } from "../utils/generateIds.js"; // you can implement similar to DEP id

// Create SubDepartment
export const createSubDepartment = async (req, res) => {
  try {
    const { parentDeptId, name, level, taluka, address, phone, email, officerName, officerDesignation, workingHours, location } = req.body;

    if (!parentDeptId) return res.status(400).json({ message: "parentDeptId required" });
    if (!name || !name.en || !name.mr) return res.status(400).json({ message: "name.en and name.mr required" });
    if (!level) return res.status(400).json({ message: "level required" });

    // ensure parent department exists
    const parentDept = await Department.findOne({ deptId: parentDeptId });
    if (!parentDept) return res.status(404).json({ message: "Parent Department not found" });

    const subDeptId = await generateSubDeptId();

    const subDept = new SubDepartment({
      subDeptId,
      parentDept: parentDept._id,
      name,
      level,
      taluka: taluka || null,
      address: address || "",
      phone: phone || "",
      email: email || "",
      officerName: officerName || "",
      officerDesignation: officerDesignation || "",
      workingHours: workingHours || {},
      location: location || {}
    });

    await subDept.save();

    res.status(201).json({ message: "SubDepartment created", data: subDept });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all subdepartments (with parent dept)
export const getAllSubDepartments = async (req, res) => {
  try {
    const list = await SubDepartment.find()
      .populate("parentDept")
      .sort({ createdAt: -1 });
    res.json({ message: "SubDepartments fetched", data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single
export const getSubDepartmentById = async (req, res) => {
  try {
    const { subDeptId } = req.params;
    const subDept = await SubDepartment.findOne({ subDeptId }).populate("parentDept");
    if (!subDept) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Fetched", data: subDept });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update
export const updateSubDepartment = async (req, res) => {
  try {
    const { subDeptId } = req.params;
    const updates = req.body;
    // if parentDeptId provided, convert to ObjectId
    if (updates.parentDeptId) {
      const parent = await Department.findOne({ deptId: updates.parentDeptId });
      if (!parent) return res.status(404).json({ message: "Parent Department not found" });
      updates.parentDept = parent._id;
      delete updates.parentDeptId;
    }
    const updated = await SubDepartment.findOneAndUpdate({ subDeptId }, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete
export const deleteSubDepartment = async (req, res) => {
  try {
    const { subDeptId } = req.params;
    const deleted = await SubDepartment.findOneAndDelete({ subDeptId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
