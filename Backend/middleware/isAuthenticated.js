import jwt from 'jsonwebtoken'
import config from '../config/config.js';
import Session from '../models/session.model.js';

const isAuthenticated = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: " access Token not found",
      });
    }

    const decode = await jwt.verify(accessToken, config.JWT_SECRET_KEY);

    const session = await Session.findOne({
      _id: decode.sessionId,
      user: decode.id,
      revoked: false,
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "session not found",
      });
    }

    req.user = {
      sessionId: decode.sessionId,
      id: decode.id,
      role: decode.role,
    };
    return next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default isAuthenticated;
