export const getMediaTypeAndResource = (mimetype) => {
  // Default
  let type = "image";
  let resource_type = "image";

  if (mimetype.startsWith("video/")) {
    type = "video";
    resource_type = "video";
  } 
  else if (mimetype.startsWith("audio/")) {
    type = "audio";
    resource_type = "video"; // Cloudinary stores audio in video type
  } 
  else if (mimetype === "application/pdf") {
    type = "pdf";
    resource_type = "raw";
  }

  return { type, resource_type };
};
