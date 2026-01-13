import express from "express";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import { verifyJWT } from "./middleware/auth.js";

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
  })
);

app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/cart", verifyJWT, cartRouter);

app.listen(process.env.PORT, () => {
  console.log(
    `Server started at ${process.env.PORT} \nAccess via http://localhost:${process.env.PORT}`
  );
});
