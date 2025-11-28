import { model, Schema, Types } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cart: {
      type: Types.ObjectId,
      ref: "Cart",
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    // payments: {
    //   type: Types.ObjectId,
    //   ref: "Payment",
    // },
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
