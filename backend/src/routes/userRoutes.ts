import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { userParamsSchema, updateProfileSchema, usernameParamsSchema } from "../validations/userSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import * as userController from "@/controllers/userController";

const router = Router();

router.get("/me", authenticateToken, asyncWrap(userController.getCurrentUser));
router.put("/me", authenticateToken, validate({ body: updateProfileSchema }), asyncWrap(userController.updateProfile));
router.get("/username/:username", validate({ params: usernameParamsSchema }), asyncWrap(userController.getUserByUsername));
router.get("/:id", validate({ params: userParamsSchema }), asyncWrap(userController.getUserById));

export default router;
