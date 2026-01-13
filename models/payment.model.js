import { model, Schema, Types } from "mongoose";

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
    // reference is from Paystack, helps to find the transaction.
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    // Money status, to know if the payment was successful or not.
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "pending-refund"],
      default: "pending",
    },
    // Delivery status, to know if the product has been delivered.
    deliveryStatus: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String }, // e.g. card, PayPal
  },
  { timestamps: true }
);

export const Payment = model("Payment", PaymentSchema);
