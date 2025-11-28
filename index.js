import express from "express";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

configDotenv();

const app = express();

connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(
    `Server started at ${process.env.PORT} \n Access via http://localhost:${process.env.PORT}`
  );
});
