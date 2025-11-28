import { model, Schema, Types } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stocks: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = model("Product", ProductSchema);
