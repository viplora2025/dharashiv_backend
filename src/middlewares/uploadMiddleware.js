import multer from "multer";
import { isMimeSupported } from "../utils/mediaType.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (isMimeSupported(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Unsupported file type: ${file.mimetype}`
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB (voice safe)
    files: 11, // 1 voice + 10 attachments max
  },
  fileFilter,
});

export default upload;
