import { Router } from "express";
import {
  handleWebHook,
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller";
import { verifyJWT } from "../middleware/auth";

const router = Router();

router.post("/intialize_payment", verifyJWT, initializePayment);
router.get("/verify_payment", verifyJWT, verifyPayment);
router.post("/webhook", handleWebHook);

export default router;
