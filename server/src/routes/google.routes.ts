import { Router } from "express";
import { googleCallback, googleLogin } from "../controllers/google.controller";

const router = Router();

router.get("/login", googleLogin);
router.get("/callback", googleCallback);

export default router;