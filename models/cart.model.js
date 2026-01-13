import { model, Schema, Types } from "mongoose";

const CartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // If you wanna implement soft delete for the cart. A starting point.
    // isDeleted: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
  },
  { timestamps: true }
);

export const Cart = model("Cart", CartSchema);
