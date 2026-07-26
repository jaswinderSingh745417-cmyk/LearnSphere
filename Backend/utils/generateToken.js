import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateToken = (user,sessionId) => {
  const token = jwt.sign(
    { id: user._id, role: user.role,sessionId },
    config.JWT_SECRET_KEY,
    {
      expiresIn: "15m",
    },
  );

  return token;
};

export default generateToken;
