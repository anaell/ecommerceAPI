import axios from "axios";
import { Cart } from "../models/cart.model.js";
import { Payment } from "../models/payment.model.js";
import { Product } from "../models/product.model.js";
import "node:crypto";
import { startSession } from "mongoose";

export const initializePayment = async (req, res) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const { id: userId, email } = req.user;
    // Find user's cart
    const userCart = await Cart.findOne({ user: userId })
      .populate("products.product")
      .session(session);
    // Check if cart is empty or if cart does not exist.
    if (!userCart || userCart.products.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Cart is empty or not found" });
    }

    let totalAmount = 0;
    const products_in_cart = userCart.products.map((product) => {
      const price = product.product.price * product.quantity;
      totalAmount += price;
      // Returning the below to make things easier when creating the payment snapshot
      return {
        product: product.product._id,
        quantity: product.quantity,
        priceAtPurchase: price,
      };
    });

    // To generate a unique reference which is needed by paystack to be able to track the payment
    const uniqueReference = `CHIMES-DEV-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // This check if there's any product stock that is lower than the quantity being ordered.
    const stock_issues = [];
    const check_product_stock = userCart.products.map((product) => {
      const stock = product.product.stocks;
      if (stock < product.quantity) {
        return stock_issues.push({
          error: `Quantity of ${product.product.name} available is less than the quantity being ordered.`,
        });
      }
    });

    // If there are stock issues run this.
    if (stock_issues.length > 0) {
      await session.abortTransaction();
      return res.status(410).json({ issue: stock_issues });
    }

    // Make a request to paystack to initalize using axios
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: totalAmount * 100, reference: uniqueReference },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
        },
      }
    );

    // Create the payment snapshot in the database
    await Payment.create(
      {
        user: userId,
        products: products_in_cart,
        totalAmount,
        reference: uniqueReference,
      },
      { session }
    );

    // Return the Paystack Authorization URL
    await session.commitTransaction();
    res.status(200).json({
      data: paystackResponse.data.data.authorization_url,
      reference: uniqueReference,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(
      `This error Happened in the initialize payment in the payment controller. \n${error}`
    );
    return res.status(500).json({ error: "Could not initialize payment" });
  } finally {
    await session.endSession();
  }
};

export const verifyPayment = async (req, res) => {
  const session = await startSession();
  session.startTransaction();

  try {
    // Get the reference
    const { reference } = req.query;

    // Make a verification request to paystack passing in the reference
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
        },
      }
    );
    // Retrieve the status of the request
    const { status } = paystackResponse.data.data;

    // If success do the below
    if (status === "success") {
      const payment = await Payment.findOne({ reference }).session(session);

      // Check if payment record exists
      if (!payment) {
        await session.abortTransaction();
        return res.status(404).json({ error: "Payment record not found" });
      }

      // Check if payment has already been worked on
      if (payment.paymentStatus === "success") {
        await session.abortTransaction();
        return res.status(200).json({ message: "Payment already verified" });
      }

      // Update the payment and delivery status to success
      payment.paymentStatus = "success";
      payment.deliveryStatus = "paid";
      await payment.save({ session });

      // To decrement the stocks for the products purchased
      for (const product of payment.products) {
        await Product.findByIdAndUpdate(
          product.product,
          {
            $inc: { stocks: -product.quantity },
          },
          { session }
        );
      }

      // Delete the user's cart
      await Cart.findOneAndDelete({ user: payment.user }, { session });

      await session.commitTransaction();

      return res.status(200).json({ message: "Payment was successful" });
    }
    await session.abortTransaction();
    res.status(400).json({ error: "Payment verification failed" });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      `This error Happened in the verify payment in the payment controller. \n${error}`
    );
    res.status(500).json("Something went wrong");
  } finally {
    await session.endSession();
  }
};

export const handleWebHook = async (req, res) => {
  const session = await startSession(); //start a session
  session.startTransaction(); //start a transaction
  // A Transaction ensures that a series of database operations are treated as a single "unit of work."
  // So if something fails mid way, everything fails and is retried later
  try {
    const { createHmac } = await import("node:crypto");

    // To verify the signature from paystack
    const hash = createHmac("sha512", process.env.PAYSTACK_TEST_SECRET_KEY)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"])
      return res.status(401).json({ error: "Invalid signature" });

    // Get the event and also the data from the body
    const { event, data } = req.body;
    const { reference } = data;

    // Handle successful charge
    if (event === "charge.success") {
      const payment = await Payment.findOne({ reference }).session(session); // Pass the session to the query

      // Check if payment record exists
      if (!payment) {
        await session.abortTransaction(); //End the session
        return res.status(200).json({ error: "Payment record not found" });
      }

      // Check if payment has already been worked on (Idempotency check)
      if (payment.paymentStatus === "success") {
        await session.abortTransaction(); // End the session
        return res.status(200).json({ message: "Already processed" });
      }

      // Update the payment and delivery status to success
      payment.paymentStatus = "success";
      payment.deliveryStatus = "paid";
      await payment.save({ session }); // Pass session to save

      // This check if there's any product stock that is lower than the quantity being ordered.
      const stock_issues = [];
      for (const product of payment.products) {
        const find_product = await Product.findById(product.product).session(
          session
        );
        if (!find_product || find_product.stocks < product.quantity) {
          stock_issues.push(
            `${find_product?.name || "Unknown"} is out of stock`
          );
        }
      }

      // If stock there are stock issues run this THAT IS A product becomes out of stock during payment lifecycle.
      if (stock_issues.length === 0) {
        // No stock issues
        // To decrement the stocks for the products purchased (Update the inventory)
        for (const product of payment.products) {
          await Product.findByIdAndUpdate(
            product.product,
            {
              $inc: { stocks: -product.quantity },
            },
            { session } //Pass session to update
          );
        }
      } else {
        // Stock issues, Logic for refund
        payment.paymentStatus = "pending-refund";
        payment.deliveryStatus = "cancelled";
        await payment.save({ session }); // Pass session to save

        // Delete the user's cart
        await Cart.findOneAndDelete({ user: payment.user }, { session });

        // We commit here because the "Refund" is a new business state
        await session.commitTransaction();

        const refund_data = { reference, products: stock_issues };
        await handleRefund(refund_data);

        return res.status(200).json({
          message:
            "A refund will be made.\nOut of stock. Refund initiated and cart cleared.",
        });
      }

      // Delete the user's cart
      await Cart.findOneAndDelete({ user: payment.user }, { session });
      await session.commitTransaction();
    }

    return res.sendStatus(200);
  } catch (error) {
    // If anything fails abort session and undo everything
    await session.abortTransaction();
    console.error(
      `This error Happened in the handle web hook in the payment controller.\nWebhook Error: ${error}`
    );
    res.status(500).json("Something went wrong");
  } finally {
    // Always end the session
    await session.endSession();
  }
};

const handleRefund = async (data) => {
  const paystackResponse = await axios.post("https://api.paystack.co/refund", {
    transaction: data.reference,
    merchant_note: `Out of stock:\n ${data.products}`,
  });
  return paystackResponse;
};
