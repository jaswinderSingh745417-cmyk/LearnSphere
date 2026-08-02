import { genOtp } from "../utils/generateOtp.js";
import Otp from "../models/otp.model.js";
import hashToken from "../utils/hashToken.js";
import { sendEmail } from "./email.service.js";

 const sendVerificationOtp = async (user,purpose) => {
  try {
    const otp = genOtp();
    console.log(otp)

    await Otp.deleteMany({
      email: user.email,
      purpose
    });

    const otpHash = hashToken(otp);

    await Otp.create({
      user: user._id,
      email: user.email,
      otpHash,
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(
      user.email,
      `Your verification OTP is ${otp}. It will expire in 5 minutes.`,
      `your otp code is ${otp}`,
    );
  } catch (error) {
    console.error("something went wrong while sending email", error);
    throw error;
  }
};


export default  sendVerificationOtp

