// src/services/journeyService.js

import Journey from "../models/journeyModel.js";
import { storageService } from "../services/storageService.js";
import { validateFileSignature } from "../utils/fileSignature.js";

/**
 * Handle image upload logic for Journey milestone
 */
const uploadImageIfPresent = async (file) => {
  if (!file) return null;

  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const ok = validateFileSignature(file);
  if (!ok) {
    throw new Error("File signature mismatch / corrupted file");
  }

  const uploadResult = await storageService.uploadFile(
    file.buffer,
    file.mimetype,
    "journeys"
  );
  return {
    url: uploadResult.url,
    publicId: uploadResult.publicId
  };
};

/**
 * Service to create a new journey entry
 */
export const createJourneyService = async (req) => {
  const { sr, years, title, description } = req.body;

  let uploadedFile = null;
  try {
    const uploadResult = await uploadImageIfPresent(req.file);
    if (uploadResult) {
      uploadedFile = uploadResult;
    }

    const doc = await Journey.create({
      sr: Number(sr),
      years,
      title: {
        en: title.en,
        mr: title.mr
      },
      description: {
        en: description.en,
        mr: description.mr
      },
      imageUrl: uploadedFile?.url || null,
      imagePublicId: uploadedFile?.publicId || null,
      createdBy: req.user._id
    });

    return doc;
  } catch (err) {
    // Cleanup image from Cloudinary if DB save fails
    if (uploadedFile?.publicId) {
      await storageService.deleteFile(uploadedFile.publicId);
    }
    throw err;
  }
};

/**
 * Service to update an existing journey entry
 */
export const updateJourneyService = async (id, req) => {
  const existing = await Journey.findById(id);
  if (!existing) {
    throw new Error("Journey milestone not found");
  }

  const oldImagePublicId = existing.imagePublicId;
  const { sr, years, title, description } = req.body;

  const updates = {};
  if (sr !== undefined) updates.sr = Number(sr);
  if (years !== undefined) updates.years = years;
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;

  let newUploadedFile = null;
  try {
    const uploadResult = await uploadImageIfPresent(req.file);
    if (uploadResult) {
      newUploadedFile = uploadResult;
      updates.imageUrl = newUploadedFile.url;
      updates.imagePublicId = newUploadedFile.publicId;
    }

    const doc = await Journey.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    // Cleanup OLD image if NEW one was uploaded successfully
    if (newUploadedFile && oldImagePublicId) {
      await storageService.deleteFile(oldImagePublicId);
    }

    return doc;
  } catch (err) {
    // Cleanup NEW image if DB update fails
    if (newUploadedFile?.publicId) {
      await storageService.deleteFile(newUploadedFile.publicId);
    }
    throw err;
  }
};

/**
 * Service to delete a journey entry
 */
export const deleteJourneyService = async (id) => {
  const doc = await Journey.findById(id);
  if (!doc) {
    throw new Error("Journey milestone not found");
  }

  // Delete image from Cloudinary first
  if (doc.imagePublicId) {
    await storageService.deleteFile(doc.imagePublicId);
  }

  await doc.deleteOne();
  return true;
};

/**
 * Service to fetch a single journey milestone
 */
export const getJourneyByIdService = async (id) => {
  const doc = await Journey.findById(id);
  if (!doc) {
    throw new Error("Journey milestone not found");
  }
  return doc;
};

/**
 * Service to fetch all journey milestones sorted by SR
 */
export const getAllJourneysService = async () => {
  return await Journey.find().sort({ sr: 1 });
};
