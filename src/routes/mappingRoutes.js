import express from "express";
import {
  createMapping,
  bulkMapping,
  getVillagesBySubDept,
  getSubDeptsByVillage,
  deleteMapping,
  getSubDeptByVillageAndCategory
} from "../controllers/mappingController.js";

const router = express.Router();

router.post("/create", createMapping);
router.post("/bulk", bulkMapping);
router.get("/search", getSubDeptByVillageAndCategory); // New smart routing endpoint
router.get("/subdept/:subDeptId/villages", getVillagesBySubDept);
router.get("/village/:villageId/subdepts", getSubDeptsByVillage);
router.delete("/delete/:id", deleteMapping);

export default router;
