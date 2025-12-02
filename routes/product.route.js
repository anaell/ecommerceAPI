import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

router.get("", getProduct);
router.delete("/:id", verifyJWT, deleteProduct);
router.put("/:id", verifyJWT, updateProduct);
router.post("", verifyJWT, createProduct);

export default router;
