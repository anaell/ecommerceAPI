import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";

export const checkProductExists = async (productId) => {
  const product = await Product.findById(productId);
  return product;
};

// export const checkCartExists = async (userId) => {
//   const cart = await Cart.findOne({ user: userId });
//   return cart;
// };
