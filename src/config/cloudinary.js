<<<<<<< HEAD
import { v2 as cloudinary } from "cloudinary";

console.log("🔴 BEFORE CONFIG", {
  name: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
  key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
  secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
});
=======
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
>>>>>>> 5001359f05cd43e8d6f1e0e45217c004386b3233

cloudinary.config(configPayload);

console.log("✅ Cloudinary configured using", env.CLOUDINARY_URL ? "CLOUDINARY_URL" : "individual credentials");

export default cloudinary;
