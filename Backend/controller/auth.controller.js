import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import hashToken from "../utils/hashToken.js";
import Session from "../models/session.model.js";
import config from "../config/config.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, avatar, bio, dateOfBirth } = req.body;

    //Manual request validation
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "fullName  is required",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email  is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password  is required",
      });
    }
    if (!dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "dateOfBirth  is required",
      });
    }

    const isAlreadyRegistered = await User.findOne({ email });
    if (isAlreadyRegistered) {
      return res.status(409).json({
        success: false,
        message: "user already exist",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: passwordHash,
      avatar,
      bio,
      dateOfBirth,
    });
    res.status(201).json({
      success: true,
      message: "Data recived successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email-Id or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email-Id or password",
      });
    }

    const session = await Session.create({
      user: user._id,
      refreshTokenHash: "",
    });

    //token generation

    const accessToken = generateToken(user,session._id);

    const refreshToken = generateRefreshToken(user, session._id);

    const refreshTokenHash = hashToken(refreshToken);

    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken",accessToken,{
      httpOnly : true,
      secure  : false,
      sameSite : "lax",
      maxAge : 15 * 60 *  1000

  })

    return res.status(200).json({
      success: true,
      message: "User logged in Successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
     
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: " refresh Token not found",
      });
    }

    const decode = jwt.verify(refreshToken, config.REFRESHTOKEN_SECRET);

    const refreshTokenHash = hashToken(refreshToken)

    const session = await Session.findOne({
      _id: decode.sessionId,
      user: decode.id,
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: " session not found",
      });
    }

    const user = await User.findById(decode.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not Found",
      });
    }

    const accessToken = generateToken(user,session._id);

    const newRefreshtoken = generateRefreshToken(user, session._id);

    const newRefreshTokenHash = hashToken(newRefreshtoken);

    session.refreshTokenHash = newRefreshTokenHash;

    await session.save();

    res.cookie("refreshToken", newRefreshtoken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
      res.cookie("accessToken",accessToken,{
      httpOnly : true,
      secure  : false,
      sameSite : "lax",
      maxAge : 15 * 60 *  1000

  })

    return res.status(200).json({
      success: true,
      message: "refresh token rotation done",
     
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const Logout = async (req,res)=>{
  try {
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
      return res.status(401).json({
        success : false,
        message : "refresh Token not found"
      })
    }
    

    const decode = jwt.verify(refreshToken, config.REFRESHTOKEN_SECRET);

    const refreshTokenHash = hashToken(refreshToken)

    const session = await Session.findOne({
       _id : decode.sessionId,
       user : decode.id,
       refreshTokenHash,
       revoked : false
    })
    if(!session){
      return res.status(401).json({
        success : false,
        message : "session not found"
      })
    }

    session.revoked = true;
    await session.save();

  res.clearCookie("refreshToken",{
    httpOnly  :true,
    secure : false,
    sameSite : " lax"
  })
  return res.status(200).json({
    success : true,
    message : "user Logged out succesfully"

  })

    
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success : false,
      message : "Internal server error"
    })
    
  }
}
