import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { registerSchema, loginSchema } from "../validations/userSchemas.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), authController.register);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post("/logout", authenticateToken, authController.logout);

export default router;