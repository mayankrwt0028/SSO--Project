import { Router } from "express";
import { signup, login, getMe, logout, createPassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login)
router.post("/create-password", createPassword)
router.get("/me", authMiddleware, getMe)
router.post("/logout", logout)
export default router