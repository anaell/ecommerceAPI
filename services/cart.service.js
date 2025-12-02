import { Product } from "../models/product.model.js";

export const checkProductExists = async (productId) => {
  const product = await Product.findById(productId);
  return product;
};