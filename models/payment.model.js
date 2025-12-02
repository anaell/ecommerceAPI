import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true }, // snapshot of price
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String }, // e.g. card, PayPal
  },
  { timestamps: true }
);

export const Payment = model("Payment", PaymentSchema);
