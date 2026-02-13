import express from "express";
import { auth, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";
import {
  createDailyVisitor,
  updateDailyVisitor,
  deleteDailyVisitor,
  getDailyVisitorById,
  getAllDailyVisitors,
  getDailyVisitorsByDate,
  getDailyVisitorsByWeek,
  getDailyVisitorsByMonth,
  getDailyVisitorsByYear
} from "../controllers/dailyVisitorController.js";

const router = express.Router();

router.post("/", auth, adminOnly, createDailyVisitor);
router.put("/:id", auth, adminOnly, updateDailyVisitor);
router.delete("/:id", auth, adminOnly, deleteDailyVisitor);

router.get("/", auth, staffOnly, getAllDailyVisitors);
router.get("/by-date/:date", auth, staffOnly, getDailyVisitorsByDate);
router.get("/by-week", auth, staffOnly, getDailyVisitorsByWeek);
router.get("/by-month/:year/:month", auth, staffOnly, getDailyVisitorsByMonth);
router.get("/by-year/:year", auth, staffOnly, getDailyVisitorsByYear);
router.get("/:id", auth, staffOnly, getDailyVisitorById);

export default router;
