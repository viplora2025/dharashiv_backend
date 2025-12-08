import DeptVillageMap from "../models/deptVillageMapModel.js";
import SubDepartment from "../models/subDepartmentModel.js";
import Department from "../models/departmentModel.js";
import Village from "../models/villageModel.js";

/**
 * Create single mapping: subDeptId (string) + villageId (string) + level + priority
 */
export const createMapping = async (req, res) => {
  try {
    const { subDeptId, villageId, level = "primary", priority = 1 } = req.body;
    if (!subDeptId || !villageId) return res.status(400).json({ message: "subDeptId and villageId required" });

    const subDept = await SubDepartment.findOne({ subDeptId });
    if (!subDept) return res.status(404).json({ message: "SubDepartment not found" });

    const village = await Village.findOne({ villageId });
    if (!village) return res.status(404).json({ message: "Village not found" });

    const map = await DeptVillageMap.create({
      subDepartment: subDept._id,
      village: village._id,
      level,
      priority
    });

    res.status(201).json({ message: "Mapping created", data: map });
  } catch (err) {
    // handle duplicate mapping
    if (err.code === 11000) return res.status(400).json({ message: "Mapping already exists" });
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Bulk mapping: accept array of { subDeptId, villageId, level, priority }
 */
export const bulkMapping = async (req, res) => {
  try {
    const { mappings } = req.body;
    if (!Array.isArray(mappings)) return res.status(400).json({ message: "mappings array required" });

    // Prepare inserts
    const toInsert = [];
    for (const m of mappings) {
      const { subDeptId, villageId, level = "primary", priority = 1 } = m;
      const subDept = await SubDepartment.findOne({ subDeptId });
      const village = await Village.findOne({ villageId });
      if (!subDept || !village) {
        // skip or collect errors; here we skip silently (you can collect)
        continue;
      }
      toInsert.push({
        subDepartment: subDept._id,
        village: village._id,
        level,
        priority
      });
    }

    if (toInsert.length === 0) return res.status(400).json({ message: "No valid mappings to insert" });

    // Use insertMany with ordered:false to continue on duplicates
    const inserted = await DeptVillageMap.insertMany(toInsert, { ordered: false });
    res.json({ message: "Bulk mapping inserted", insertedCount: inserted.length });
  } catch (err) {
    console.error(err);
    // partial success possible; send basic feedback
    res.status(500).json({ message: "Error during bulk insert" });
  }
};

// Get villages for a subDepartment
export const getVillagesBySubDept = async (req, res) => {
  try {
    const { subDeptId } = req.params;
    const subDept = await SubDepartment.findOne({ subDeptId });
    if (!subDept) return res.status(404).json({ message: "SubDepartment not found" });

    const maps = await DeptVillageMap.find({ subDepartment: subDept._id })
      .populate("village")
      .sort({ priority: 1 });

    res.json({ message: "Villages fetched", data: maps.map(m => m.village) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get subDepartments for a village (ordered by priority)
export const getSubDeptsByVillage = async (req, res) => {
  try {
    const { villageId } = req.params;
    const village = await Village.findOne({ villageId });
    if (!village) return res.status(404).json({ message: "Village not found" });

    const maps = await DeptVillageMap.find({ village: village._id })
      .populate({
        path: "subDepartment",
        populate: { path: "parentDept" } // include parent category
      })
      .sort({ priority: 1 });

    res.json({ message: "SubDepartments fetched", data: maps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete mapping
export const deleteMapping = async (req, res) => {
  try {
    const { id } = req.params; // mapping id
    const deleted = await DeptVillageMap.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Mapping not found" });
    res.json({ message: "Mapping deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get SubDepartment (Office) by Village + Department (Category)
 * Usage: GET /search?villageId=VLG001&deptId=DEP001
 */
export const getSubDeptByVillageAndCategory = async (req, res) => {
  try {
    const { villageId, deptId } = req.query;

    if (!villageId || !deptId) {
      return res.status(400).json({ message: "villageId and deptId query params are required" });
    }

    // 1. Find Village ObjectId
    const village = await Village.findOne({ villageId });
    if (!village) return res.status(404).json({ message: "Village not found" });

    // 2. Find Department ObjectId
    const parentDept = await Department.findOne({ deptId });
    if (!parentDept) return res.status(404).json({ message: "Department not found" });

    // 3. Find SubDepartments under this Department
    // We only need their _ids to filter the map
    const potentialSubDepts = await SubDepartment.find({ parentDept: parentDept._id }).select("_id");
    const subDeptIds = potentialSubDepts.map(sd => sd._id);

    if (subDeptIds.length === 0) {
      return res.status(404).json({ message: "No offices found for this department category" });
    }

    // 4. Find the Mapping
    const mapping = await DeptVillageMap.findOne({
      village: village._id,
      subDepartment: { $in: subDeptIds }
    }).populate({
      path: "subDepartment",
      populate: { path: "parentDept" }
    });

    if (!mapping) {
      return res.status(404).json({ message: "No office assigned for this village and department" });
    }

    // Return the SubDepartment directly (or the mapping if extra info needed)
    res.json({
      message: "Office found",
      data: mapping.subDepartment,
      level: mapping.level,
      priority: mapping.priority
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
