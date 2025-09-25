import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { userParamsSchema, updateProfileSchema, usernameParamsSchema } from "../validations/userSchemas.js";
import * as userController from "@/controllers/userController";

const router = Router();

router.get("/me", authenticateToken, userController.getCurrentUser);
router.put("/me", authenticateToken, validate({ body: updateProfileSchema }), userController.updateProfile);
router.get("/username/:username", validate({ params: usernameParamsSchema }), userController.getUserByUsername);
router.get("/:id", validate({ params: userParamsSchema }), userController.getUserById);

export default router;
