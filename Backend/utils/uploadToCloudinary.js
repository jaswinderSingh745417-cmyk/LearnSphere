import cloudinary from "../config/Cloudinary.js";
import streamifier from "streamifier";

export const uploadCloudinary = (buffer, folder = "learnSphere") => {
  return new Promise((resolve, reject) => {
    const uplaodStream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uplaodStream);
  });
};

export default uploadCloudinary
