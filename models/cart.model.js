import { model, Schema, Types } from "mongoose";

const CartSchema = new Schema(
  {
    products: {
      type: [Types.ObjectId],
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Cart = model("Cart", CartSchema);
