import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user required for otp model"],
  },
  email: {
    type: String,
    required: [true, "email is required for otp model"],
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
    required: true,
  },
  expiresAt : {
    type : Date,
    required  :true,
    index:{
        expires : 0
    }


  }
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
