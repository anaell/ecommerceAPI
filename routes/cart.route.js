import { Router } from "express";
import {
  addToCart,
  clearCart,
  editCart,
  fetchCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("", fetchCart);
router.post("", addToCart);
router.put("", editCart);
router.delete("", clearCart);

export default router;
