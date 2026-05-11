// src/utils/fileSignature.js
//
// Magic-byte validator. The signature shapes are defined alongside each
// mimetype in mediaType.js — this file is just the matcher.

import { MIME_REGISTRY } from "./mediaType.js";

const matchBytes = (buf, sig) => {
  const offset = sig.offset || 0;
  if (buf.length < offset + sig.bytes.length) return false;
  for (let i = 0; i < sig.bytes.length; i++) {
    if (buf[offset + i] !== sig.bytes[i]) return false;
  }
  return true;
};

const matchAscii = (buf, sig) => {
  const offset = sig.offset || 0;
  const end = offset + sig.ascii.length;
  if (buf.length < end) return false;
  return buf.toString("ascii", offset, end) === sig.ascii;
};

const matchRiff = (buf, sig) => {
  if (buf.length < 12) return false;
  return (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === sig.riff
  );
};

const matchMp3Frame = (buf) =>
  buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;

const matchAacAdts = (buf) =>
  buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xf0) === 0xf0;

// Cheap "looks like text" check: sample the first 512 bytes and reject if any
// disallowed control byte appears. UTF-8 high bytes are allowed.
const matchPrintableText = (buf) => {
  const len = Math.min(buf.length, 512);
  for (let i = 0; i < len; i++) {
    const b = buf[i];
    if (b === 0x09 || b === 0x0a || b === 0x0d) continue; // tab, LF, CR
    if (b >= 0x20 && b <= 0x7e) continue;                  // printable ASCII
    if (b >= 0x80) continue;                                // UTF-8 leading/continuation
    return false;
  }
  return true;
};

const matchOne = (buf, sig) => {
  if (sig.bytes) return matchBytes(buf, sig);
  if (sig.ascii) return matchAscii(buf, sig);
  if (sig.riff) return matchRiff(buf, sig);
  if (sig.mp3Frame) return matchMp3Frame(buf);
  if (sig.aacAdts) return matchAacAdts(buf);
  if (sig.printableText) return matchPrintableText(buf);
  return false;
};

export const validateFileSignature = (file) => {
  const buf = file?.buffer;
  const mimetype = file?.mimetype;

  if (!buf || buf.length < 4) return false;

  const entry = MIME_REGISTRY[mimetype];
  if (!entry || !entry.signatures?.length) return false;

  return entry.signatures.some((sig) => matchOne(buf, sig));
};
