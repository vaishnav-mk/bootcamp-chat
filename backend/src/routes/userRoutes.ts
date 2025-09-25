import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validateSchema, validateParams } from "../utils/validation.js";
import { userParamsSchema, updateProfileSchema, usernameParamsSchema } from "../models/userSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import * as userController from "@/controllers/userController";

const router = Router();

router.get("/me", authenticateToken, asyncWrap(userController.getCurrentUser));
router.put("/me", authenticateToken, validateSchema(updateProfileSchema), asyncWrap(userController.updateProfile));
router.get("/username/:username", validateParams(usernameParamsSchema), asyncWrap(userController.getUserByUsername));
router.get("/:id", validateParams(userParamsSchema), asyncWrap(userController.getUserById));

export default router;
