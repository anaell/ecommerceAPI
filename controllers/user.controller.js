import { User } from "../models/user.model.js";
import { checkUserExists } from "../services/user.services.js";
import { generateJWT } from "../utils/jwtGenerator.js";
import { loginValidator, signUpValidator } from "../utils/validators.js";
import { zodError } from "../utils/zodError.js";
import bcrypt from "bcryptjs";
import { configDotenv } from "dotenv";
configDotenv();

export const signUp = async (req, res) => {
  try {
    const validatedBody = signUpValidator.parse(req.body);
    const { email, password, isAdmin } = validatedBody;

    const userExists = await checkUserExists(email);

    if (userExists) {
      console.error(`Duplicate user not possible: ${email} already exists`);
      return res.status(409).json({ error: "User already exists" });
    }

    const role = isAdmin === process.env.ADMIN_KEY ? "admin" : "user";
    const hashedPassword = await bcrypt.hash(password, process.env.SALT);

    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    const payload = {
      email: newUser.email,
      role: newUser.role,
    };

    const {
      tokens: { access, refresh },
    } = generateJWT(payload);

    newUser.refreshToken = refresh;
    await newUser.save();

    res
      .status(201)
      .cookie("refreshToken", refresh, {
        httpOnly: true, // JavaScript cannot access this cookie
        secure: true, // cookie only sent over HTTPS
        sameSite: "strict", // cookie only sent for same-site requests (helps prevent CSRF)
        maxAge: 5 * 24 * 60 * 60 * 1000, // cookie expires in 5 days
      })
      .json({ data: payload, token: access, message: "Sign up successful" });
  } catch (error) {
    zodError(error, res);
    console.error(
      `This Error Occured during SignUp.\n Error Occured: ${error}`
    );
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const validatedBody = loginValidator(req.body);
    const { email, password } = validatedBody;

    const user = await checkUserExists(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const payload = {
      email: user.email,
      role: user.role,
    };

    const {
      tokens: { access, refresh },
    } = generateJWT(payload);

    user.refreshToken = refresh;
    await user.save();
    return res
      .status(200)
      .cookie("refreshToken", refresh, {
        httpOnly: true, // JavaScript cannot access this cookie
        secure: true, // cookie only sent over HTTPS
        sameSite: "strict", // cookie only sent for same-site requests (helps prevent CSRF)
        maxAge: 5 * 24 * 60 * 60 * 1000, // cookie expires in 5 days
      })
      .json({ data: payload, token: access, message: "Login successful" });
  } catch (error) {
    zodError(error, res);
    console.error(`This Error Occured during Login.\n Error Occured: ${error}`);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const refreshToken = async (req, res) => {
  // const
};
