import { v2 as cloudinary } from "cloudinary";

console.log("🔴 BEFORE CONFIG", {
  name: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET",
  key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
  secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log("🟢 CLOUDINARY CONFIGURED");

export default cloudinary;
