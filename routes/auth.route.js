import { Router } from "express";
import {
  login,
  logout,
  refreshTokenHandler,
  signUp,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshTokenHandler);

export default router;
