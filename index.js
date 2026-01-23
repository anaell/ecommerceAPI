import express from "express";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import paymentRouter from "./routes/payment.route.js";
import { verifyJWT } from "./middleware/auth.js";
import { rateLimitMiddleware } from "./middleware/rate_limiter.js";

configDotenv();

const app = express();

connectDB();

app.use(cors());
app.use(cookieParser());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf; // Store the raw buffer for webhook verification
    },
  }),
);

app.use("/auth", rateLimitMiddleware, authRouter);
app.use("/product", rateLimitMiddleware, productRouter);
app.use("/cart", rateLimitMiddleware, verifyJWT, cartRouter);
app.use("/payment", rateLimitMiddleware, paymentRouter);

app.listen(process.env.PORT, () => {
  console.log(
    `Server started at ${process.env.PORT} \nAccess via http://localhost:${process.env.PORT}`,
  );
});
