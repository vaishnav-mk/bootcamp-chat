import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { registerSchema, loginSchema } from "../validations/userSchemas.js";
import { asyncWrap } from "../middleware/asyncWrap.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), asyncWrap(authController.register));
router.post("/login", validate({ body: loginSchema }), asyncWrap(authController.login));
router.post("/logout", authenticateToken, asyncWrap(authController.logout));

export default router;