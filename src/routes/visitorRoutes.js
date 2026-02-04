import express from "express";
import { auth, adminOnly } from "../middlewares/authMiddleware.js";
import {
  registerVisitor,
  getVisitorsByEvent,
  getVisitorsByAppUser,
  getVisitorById,
  updateVisitorStatus
} from "../controllers/visitorController.js";

const router = express.Router();

router.post("/", auth, registerVisitor);

router.get("/event/:eventId", auth, getVisitorsByEvent);

router.get("/my", auth, getVisitorsByAppUser);

router.get("/:id", auth, getVisitorById);

router.patch(
  "/:id/status",
  auth,
  adminOnly,
  updateVisitorStatus
);

export default router;
