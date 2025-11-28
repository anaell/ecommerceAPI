import jwt from "jsonwebtoken";

export const generateJWT = (user) => {
  const generateAccessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m",
    }
  );

  const generateRefreshToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "5d",
    }
  );

  return {
    tokens: {
      access: generateAccessToken,
      refresh: generateRefreshToken,
    },
  };
};

export const regenerateAccessToken = async (user) => {
  const generateAccessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m",
    }
  );

  return generateAccessToken
};
