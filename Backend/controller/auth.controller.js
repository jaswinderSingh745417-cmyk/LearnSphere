import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import hashToken from "../utils/hashToken.js";
import Session from "../models/session.model.js";
import config from "../config/config.js";
import sendVerificationOtp from "../services/otp.service.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/Cloudinary.js";

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
        message: "date of birth  is required",
      });
    }

    const isAlreadyRegistered = await User.findOne({ email });
    if (isAlreadyRegistered) {
      if (isAlreadyRegistered.isVerified) {
        return res.status(409).json({
          success: false,
          message: " Email is already verified.please Login",
        });
      }

      if (!isAlreadyRegistered.isVerified) {
        await sendVerificationOtp(isAlreadyRegistered, "EMAIL_VERIFICATION");
        return res.status(200).json({
          success: false,
          message: "otp sent to the email.please verify your email",
          user: {
            fullName: isAlreadyRegistered.fullName,
            email: isAlreadyRegistered.email,
            isVerified: isAlreadyRegistered.isVerified,
          },
        });
      }
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

    await sendVerificationOtp(user, "EMAIL_VERIFICATION");
    return res.status(201).json({
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
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: " User is not  verified. verify email first",
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

    const accessToken = generateToken(user, session._id);

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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

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

    const refreshTokenHash = hashToken(refreshToken);

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

    const accessToken = generateToken(user, session._id);

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
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

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

export const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "refresh Token not found",
      });
    }

    const decode = jwt.verify(refreshToken, config.REFRESHTOKEN_SECRET);

    const refreshTokenHash = hashToken(refreshToken);

    const session = await Session.findOne({
      _id: decode.sessionId,
      user: decode.id,
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "session not found",
      });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: " lax",
    });
    return res.status(200).json({
      success: true,
      message: "user Logged out succesfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: " User not found",
      });
    }

    const compare = await bcrypt.compare(oldPassword, user.password);
    if (!compare) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Both fields are required",
      });
    }

    const otpHash = hashToken(otp);

    const otpDoc = await Otp.findOne({
      email,
      otpHash,
      purpose: "EMAIL_VERIFICATION",
    });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired otp",
      });
    }
    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    const user = await User.findByIdAndUpdate(
      otpDoc.user,
      {
        isVerified: true,
      },
      {
        new: true,
      },
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Otp.deleteMany({
      _id: otpDoc._id,
    });

    return res.status(200).json({
      success: true,
      message: "user verified.You can login now",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email not found",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    if (user.isVerified) {
      return res.status(401).json({
        success: false,
        message: " User is already verified. Please Login",
      });
    }

    await sendVerificationOtp(user, "EMAIL_VERIFICATION");

    return res.status(200).json({
      success: true,
      message: "A new verification OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: " Email not found",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "verify the email first",
      });
    }

    await sendVerificationOtp(user, "PASSWORD_RESET");
    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Both fields are required",
      });
    }

    const otpHash = hashToken(otp);

    const otpDoc = await Otp.findOne({
      email,
      otpHash,
      purpose: "PASSWORD_RESET",
    });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "invalid Otp",
      });
    }
    if (Date.now() > otpDoc.expiresAt) {
      await Otp.findByIdAndDelete(otpDoc._id);
      return res.status(403).json({
        success: false,
        message: "OTP Expired",
      });
    }

    await Otp.findByIdAndDelete(otpDoc._id);

    const resetToken = jwt.sign(
      { userId: otpDoc.user, purpose: "PASSWORD_RESET" },
      config.PASSWORD_RESET_SECRET,
      {
        expiresIn: "10m",
      },
    );
    res.cookie("resetToken", resetToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 10 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: " Otp verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "both fields are required",
      });
    }
    if (newPassword != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm password must be same as new password",
      });
    }

    const resetToken = req.cookies.resetToken;
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: " reset token not found",
      });
    }

    const decode = jwt.verify(resetToken, config.PASSWORD_RESET_SECRET);

    if (decode.purpose !== "PASSWORD_RESET") {
      return res.status(400).json({
        success: false,
        message: "invalid reset token",
      });
    }

    const user = await User.findById(decode.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const passwordCheck = await bcrypt.compare(newPassword, user.password);
    if (passwordCheck) {
      return res.status(400).json({
        success: false,
        message: "use diffrent password from currenty password",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.password = passwordHash;
    await user.save();

    await Session.deleteMany({
      user: user._id,
    });

    res.clearCookie("resetToken");

    return res.status(200).json({
      success: true,
      message: "password reset successfull",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user data found",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { fullName, bio } = req.body;

    if (fullName == undefined && bio == undefined) {
      return res.status(400).json({
        success: false,
        message: "atleast one field is required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
        });
      }
      user.fullName = fullName.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "user information updated successfully",
      user: {
        fullName: user.fullName,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: " avatar not found",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer,"avatars")
    console.log(result)
    user.avatar.url = result.secure_url
    user.avatar.publicId = result.public_id;
    await user.save();

    return res.status(200).json({
      success : true,
      message : "avatar updated successfully",
     avatar : user.avatar
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAvatar = async (req,res)=>{
  try {

    const user = await User.findById(req.user.id)
      if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

 
    if(!user.avatar.publicId){
      return res.status(400).json({
        success : false,
        message : "avatar not exists"
      })
    }
    await cloudinary.uploader.destroy(user.avatar.publicId)
    user.avatar.url = "";
    user.avatar.publicId = ""

    await user.save({validateBeforeSave : false})
    return res.status(200).json({
      success : true ,
      message : "Avatar deleted successfully"
    })
    
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success : false,
      message : "Internal server error"
    })
    
  }

}
