import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
   
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("thers an error while sending email", error);
  } else {
    console.log("email server is ready to send email");
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `LearnSphere <${config.GOOGLE_USER}>`,
      to,
      subject,
      html,
    });

    console.log("message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("error sending email", error);
    throw error;
  }
};
