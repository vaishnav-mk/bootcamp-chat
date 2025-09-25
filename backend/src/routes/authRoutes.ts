import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validateSchema } from "../utils/validation.js";
import { registerSchema, loginSchema } from "../models/userSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", validateSchema(registerSchema), asyncWrap(authController.register));
router.post("/login", validateSchema(loginSchema), asyncWrap(authController.login));
router.post("/logout", authenticateToken, asyncWrap(authController.logout));

export default router;