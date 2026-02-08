import express from "express";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";
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

router.get("/", auth, getAllDailyVisitors);
router.get("/by-date/:date", auth, getDailyVisitorsByDate);
router.get("/by-week", auth, getDailyVisitorsByWeek);
router.get("/by-month/:year/:month", auth, getDailyVisitorsByMonth);
router.get("/by-year/:year", auth, getDailyVisitorsByYear);
router.get("/:id", auth, getDailyVisitorById);

export default router;
