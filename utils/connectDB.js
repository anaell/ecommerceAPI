import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

export const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("Database connected"));
  } catch (error) {
    console.error(
      `This error occured when connecting to the database:\n${error}`
    );

    throw new Error("Error connecting to database");
  }
};
