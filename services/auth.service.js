import { User } from "../models/user.model.js";

export const checkUserExists = async (email) => {
  const user = await User.findOne({ email });
  return user;
};
