export const validateFileSignature = (file) => {
  const buffer = file.buffer;
  const mimetype = file.mimetype;

  if (!buffer || buffer.length < 4) {
    return false;
  }

  // JPEG: FF D8 FF
  if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimetype === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e;
  }

  // WEBP: "RIFF....WEBP"
  if (mimetype === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  // PDF: %PDF
  if (mimetype === "application/pdf") {
    return buffer.toString("ascii", 0, 4) === "%PDF";
  }

  // MP4/MOV: ....ftyp
  if (mimetype === "video/mp4") {
    return buffer.toString("ascii", 4, 8) === "ftyp";
  }

  // MPEG Program Stream: 00 00 01 BA/B3
  if (mimetype === "video/mpeg") {
    return (
      buffer[0] === 0x00 &&
      buffer[1] === 0x00 &&
      buffer[2] === 0x01 &&
      (buffer[3] === 0xba || buffer[3] === 0xb3)
    );
  }

  // QuickTime MOV: ....ftypqt
  if (mimetype === "video/quicktime") {
    return (
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      buffer.toString("ascii", 8, 10) === "qt"
    );
  }

  // MP3: ID3 or FF FB
  if (mimetype === "audio/mpeg" || mimetype === "audio/mp3") {
    return (
      buffer.toString("ascii", 0, 3) === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
    );
  }

  // WAV: RIFF....WAVE
  if (mimetype === "audio/wav") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WAVE"
    );
  }

  // WEBM (EBML): 1A 45 DF A3
  if (mimetype === "audio/webm") {
    return (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    );
  }

  // Unknown type -> reject
  return false;
};
