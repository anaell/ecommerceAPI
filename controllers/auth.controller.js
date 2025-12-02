import { ZodError } from "zod";
import { User } from "../models/user.model.js";
import { checkUserExists } from "../services/auth.service.js";
import { generateJWT, regenerateAccessToken } from "../utils/jwtGenerator.js";
import { loginValidator, signUpValidator } from "../utils/validators.js";
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
      id: user._id,
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
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(`This Error Occured during SignUp.\nError Occured: ${error}`);
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
      id: user._id,
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
    if (error instanceof ZodError) {
      console.error(error);
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error(`This Error Occured during Login.\nError Occured: ${error}`);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const refreshTokenHandler = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Issue new access token
    const newAccessToken = regenerateAccessToken(payload);

    return res.status(200).json({ token: newAccessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    console.error(`Unexpected refresh token error: ${error}`);
    return res.status(500).json({ error: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find the user by their refresh token
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = ""; // invalidate token in DB
        await user.save();
      }
    }

    // Clear the cookie whether user is found or not
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`This Error Occured during Logout.\nError Occured: ${error}`);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
