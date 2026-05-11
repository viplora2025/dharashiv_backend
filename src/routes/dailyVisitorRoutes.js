// src/routes/dailyVisitorRoutes.js

import express from "express";
import { auth, staffOnly } from "../middlewares/authMiddleware.js";
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
import validate from "../middlewares/validateMiddleware.js";
import {
  createDailyVisitorSchema,
  updateDailyVisitorSchema,
  dateParamSchema,
  monthYearParamSchema,
  yearParamSchema
} from "../validations/dailyVisitorValidation.js";

const router = express.Router();

router.post(
  "/",
  auth,
  staffOnly,
  validate(createDailyVisitorSchema),
  createDailyVisitor
);

router.put(
  "/:id",
  auth,
  staffOnly,
  validate(updateDailyVisitorSchema),
  updateDailyVisitor
);

router.delete("/:id", auth, staffOnly, deleteDailyVisitor);

router.get("/", auth, staffOnly, getAllDailyVisitors);

router.get(
  "/by-date/:date",
  auth,
  staffOnly,
  validate(dateParamSchema),
  getDailyVisitorsByDate
);

router.get("/by-week", auth, staffOnly, getDailyVisitorsByWeek);

router.get(
  "/by-month/:year/:month",
  auth,
  staffOnly,
  validate(monthYearParamSchema),
  getDailyVisitorsByMonth
);

router.get(
  "/by-year/:year",
  auth,
  staffOnly,
  validate(yearParamSchema),
  getDailyVisitorsByYear
);

router.get("/:id", auth, staffOnly, getDailyVisitorById);

export default router;
