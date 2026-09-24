import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import {
  getUsers,
  resendPasswordSetup,
} from "../controllers/admin.controller";

const router = Router();

router.get(
  "/users",
  authMiddleware,
  requireAdmin,
  getUsers
);

router.post(
  "/users/:id/resend-password-setup",
  authMiddleware,
  requireAdmin,
  resendPasswordSetup
);

export default router;