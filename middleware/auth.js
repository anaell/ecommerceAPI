import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(`Error in the verifyJWT. \n Error occured is:\n ${error}`);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
