// src/utils/mediaType.js
//
// Central MIME registry for the upload pipeline. Drives:
//   - multer's allow-list (uploadMiddleware.js)
//   - magic-byte signature validation (fileSignature.js)
//   - Cloudinary classification (storageService.js) — returns {type, resource_type}
//
// Adding a new format = one entry here, no changes elsewhere.
//
// Signature shape (an array; ANY match accepts the file):
//   { offset?, bytes }    raw byte sequence at offset (default 0)
//   { offset?, ascii }    ASCII string at offset
//   { riff }              RIFF container with the given form type (e.g. "WEBP", "WAVE")
//   { mp3Frame: true }    MP3 frame sync (FF Ex)
//   { aacAdts: true }     AAC ADTS sync (FF Fx)
//   { printableText: true } printable-only sample (text/plain fallback)

const bytes = (arr, offset = 0) => ({ offset, bytes: arr });
const ascii = (str, offset = 0) => ({ offset, ascii: str });
const riff = (form) => ({ riff: form });

// MP4/MOV/M4A all share the "ftyp" box at offset 4. We trust mimetype for the
// finer distinction since multer already gates the allow-list.
const FTYP = ascii("ftyp", 4);

// DOCX/XLSX/PPTX are ZIP containers
const ZIP = bytes([0x50, 0x4b, 0x03, 0x04]);
// DOC/XLS/PPT legacy Office files are OLE2 compound documents
const OLE2 = bytes([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

export const MIME_REGISTRY = Object.freeze({
  // ===== IMAGES =====
  "image/jpeg": { type: "image", resource_type: "image", signatures: [bytes([0xff, 0xd8, 0xff])] },
  "image/jpg":  { type: "image", resource_type: "image", signatures: [bytes([0xff, 0xd8, 0xff])] },
  "image/png":  { type: "image", resource_type: "image", signatures: [bytes([0x89, 0x50, 0x4e, 0x47])] },
  "image/webp": { type: "image", resource_type: "image", signatures: [riff("WEBP")] },

  // ===== VIDEO =====
  "video/mp4":       { type: "video", resource_type: "video", signatures: [FTYP] },
  "video/mpeg":      { type: "video", resource_type: "video", signatures: [bytes([0x00, 0x00, 0x01, 0xba]), bytes([0x00, 0x00, 0x01, 0xb3])] },
  "video/quicktime": { type: "video", resource_type: "video", signatures: [FTYP] },

  // ===== AUDIO (Cloudinary stores audio under resource_type "video") =====
  "audio/mpeg":  { type: "audio", resource_type: "video", signatures: [ascii("ID3"), { mp3Frame: true }] },
  "audio/mp3":   { type: "audio", resource_type: "video", signatures: [ascii("ID3"), { mp3Frame: true }] },
  "audio/wav":   { type: "audio", resource_type: "video", signatures: [riff("WAVE")] },
  "audio/x-wav": { type: "audio", resource_type: "video", signatures: [riff("WAVE")] },
  "audio/webm":  { type: "audio", resource_type: "video", signatures: [bytes([0x1a, 0x45, 0xdf, 0xa3])] },
  "audio/ogg":   { type: "audio", resource_type: "video", signatures: [ascii("OggS")] },
  "audio/aac":   { type: "audio", resource_type: "video", signatures: [{ aacAdts: true }] },
  "audio/mp4":   { type: "audio", resource_type: "video", signatures: [FTYP] },
  "audio/m4a":   { type: "audio", resource_type: "video", signatures: [FTYP] },
  "audio/x-m4a": { type: "audio", resource_type: "video", signatures: [FTYP] },

  // ===== DOCUMENTS =====
  "application/pdf": { type: "pdf", resource_type: "raw", signatures: [ascii("%PDF")] },

  // Office Open XML (modern) — ZIP container
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":   { type: "document", resource_type: "raw", signatures: [ZIP] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         { type: "document", resource_type: "raw", signatures: [ZIP] },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { type: "document", resource_type: "raw", signatures: [ZIP] },

  // Legacy Office — OLE2 compound
  "application/msword":            { type: "document", resource_type: "raw", signatures: [OLE2] },
  "application/vnd.ms-excel":      { type: "document", resource_type: "raw", signatures: [OLE2] },
  "application/vnd.ms-powerpoint": { type: "document", resource_type: "raw", signatures: [OLE2] },

  // Plain text — no reliable magic bytes; we only check it looks printable
  "text/plain": { type: "document", resource_type: "raw", signatures: [{ printableText: true }] },
});

export const ALLOWED_MIMETYPES = Object.freeze(Object.keys(MIME_REGISTRY));

// Logical media buckets the frontend can switch rendering on.
export const MEDIA_TYPES = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  PDF: "pdf",
  DOCUMENT: "document",
});

export const isMimeSupported = (mimetype) =>
  typeof mimetype === "string" && Object.prototype.hasOwnProperty.call(MIME_REGISTRY, mimetype);

// Classify an upload for Cloudinary + our DB.
// Throws on truly unknown mimetypes — callers should validate against the
// allow-list (multer filter) before reaching this point.
export const getMediaTypeAndResource = (mimetype) => {
  const entry = MIME_REGISTRY[mimetype];
  if (!entry) {
    const err = new Error(`Unsupported file type: ${mimetype}`);
    err.code = "UNSUPPORTED_MIME";
    throw err;
  }
  return { type: entry.type, resource_type: entry.resource_type };
};
