export const validateFileSignature = (file) => {
  const buffer = file.buffer;

  // JPEG: FF D8 FF
  if (file.mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (file.mimetype === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e;
  }

  // WEBP: "RIFF....WEBP"
  if (file.mimetype === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  // PDF: %PDF
  if (file.mimetype === "application/pdf") {
    return buffer.toString("ascii", 0, 4) === "%PDF";
  }

  // MP4: ....ftyp
  if (file.mimetype === "video/mp4") {
    return buffer.toString("ascii", 4, 8) === "ftyp";
  }

  // MP3: ID3 or FF FB
  if (file.mimetype === "audio/mpeg") {
    return (
      buffer.toString("ascii", 0, 3) === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
    );
  }

  // If unknown type → reject
  return false;
};
