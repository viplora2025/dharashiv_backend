import express from "express";
import { auth, userOnly, superAdminOnly } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validateMiddleware.js";
import { createFeedback, getAllFeedbacks } from "../controllers/feedbackController.js";
import { createFeedbackSchema, getFeedbacksSchema } from "../validations/feedbackValidation.js";

const router = express.Router();

router.post("/", auth, userOnly, validate(createFeedbackSchema), createFeedback);
router.get("/", auth, superAdminOnly, validate(getFeedbacksSchema), getAllFeedbacks);

export default router;
