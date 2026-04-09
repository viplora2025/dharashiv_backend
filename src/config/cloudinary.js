import env from "./env.js";
import { v2 as cloudinary } from "cloudinary";

const configPayload = env.CLOUDINARY_URL
  ? {
      secure: true,
      cloudinary_url: env.CLOUDINARY_URL,
    }
  : {
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    };

cloudinary.config(configPayload);

console.log("✅ Cloudinary configured using", env.CLOUDINARY_URL ? "CLOUDINARY_URL" : "individual credentials");

export default cloudinary;
