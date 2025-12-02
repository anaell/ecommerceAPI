import { ZodError } from "zod";
import {
  createProductValidator,
  searchQueryValidator,
  updateProductValidator,
} from "../utils/validators.js";
import { Product } from "../models/product.model.js";

// CRUD For Products - Only for the admin
export const createProduct = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ error: "Action forbidden for user" });
    }

    const validatedBody = createProductValidator.parse(req.body);
    const newProduct = await Product.create(validatedBody);

    res
      .status(201)
      .json({ data: newProduct, message: "Product created successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during createProduct.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { role } = req.user;
    const { id: productId } = req.params;

    if (role !== "admin") {
      return res.status(403).json({ error: "Action forbidden for user" });
    }

    const validatedBody = updateProductValidator.parse(req.body);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      validatedBody,
      { new: true }
    );
    res
      .status(200)
      .json({ data: updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during updateProduct.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ error: "Action forbidden for user" });
    }

    const { id: productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
    }

    await Product.findByIdAndDelete(productId);

    res.status(204).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during deleteProduct.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { search } = req.query;
    const validatedSearch = searchQueryValidator.parse(search);

    if (validatedSearch && productId) {
      console.error(
        `${req}\nUsed req.params and req.query in the same request.\nRequesting for a single product while searching through the query in the same request`
      );

      return res.status(400).json({
        error: "Cannot use both an id and a search query in the same request",
      });
    }

    if (productId) {
      const product = await Product.findById(productId);
      return res.status(200).json({ data: product });
    }

    if (validatedSearch) {
      const product = await Product.find({
        $or: [
          { name: { $regex: validatedSearch, $options: "i" } },
          { description: { $regex: validatedSearch, $options: "i" } },
        ],
      });
      return res.status(200).json({ data: product });
    }

    const products = await Product.find({});
    return res.status(200).json({ data: products });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(
      `This Error Occured during getProduct.\nError Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};
