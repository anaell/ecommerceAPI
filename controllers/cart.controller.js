import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { checkProductExists } from "../services/cart.service.js";
import {
  addProductToCartValidator,
  editCartValidator,
} from "../utils/validators.js";

export const addToCart = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const validatedBody = addProductToCartValidator.parse(req.body);
    const { product: productId, quantity } = validatedBody;
    const productExists = await checkProductExists(productId);
    if (!productExists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cartExists = await Cart.findOne({ user: userId });
    if (!cartExists) {
      const userCart = new Cart({
        products: [{ product: productId, quantity }],
        user: userId,
      });
      await userCart.save();
      const user = await User.findById(userId);
      user.cart = userCart._id;
      await user.save();
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      );
      return res
        .status(200)
        .json({ data: cart, message: "Product added successfully" });
    }

    const checkIfProductAlreadyInCart = cartExists.products.find(
      (item) => item.product.toString() === productId
    );

    if (checkIfProductAlreadyInCart) {
      const updatedCart = await Cart.findOneAndUpdate(
        { "products.product": productId, user: userId },
        { $inc: { "products.$.quantity": quantity } },
        { new: true }
      ).populate("products.product");
      return res.status(200).json({
        data: updatedCart,
        message: "Product added successfully to cart",
      });
    } else {
      cartExists.products.push({ product: productId, quantity });
      cartExists.save();
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      );
      return res
        .status(200)
        .json({ data: cart, message: "Product added successfully" });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during addToCart.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const fetchCart = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    return res.status(200).json({ data: cart });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during fetchCart.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const editCart = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const validatedBody = editCartValidator.parse(req.body);

    const updateCart = await Cart.findOneAndUpdate(
      { user: userId },
      { products: [...validatedBody] },
      { new: true }
    );
    return res
      .status(200)
      .json({ data: updateCart, message: "Cart updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during editCart.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );
    return res.status(200).json({ data: cart });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during clearCart.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};
