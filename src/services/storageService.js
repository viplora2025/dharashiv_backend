// src/services/storageService.js

import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { v2 as cloudinary } from "cloudinary";
import { getMediaTypeAndResource } from "../utils/mediaType.js";

/**
 * 🚀 Storage Service - Provider-Agnostic File Management
 * Current Implementation: Cloudinary
 * Future Readiness: Cloudflare R2 / AWS S3
 */

export const storageService = {
  /**
   * Upload a file and return a standardized metadata object
   * @param {Buffer} fileBuffer 
   * @param {string} mimetype 
   * @param {string} folder 
   * @returns {Promise<{ url: string, publicId: string, type: string, resourceType: string }>}
   */
  uploadFile: async (fileBuffer, mimetype, folder = "general") => {
    const { type, resource_type } = getMediaTypeAndResource(mimetype);

    const result = await uploadToCloudinary(fileBuffer, {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      type, // 'image', 'video', 'pdf', 'audio'
      resourceType: resource_type, // 'image', 'video', 'raw'
    };
  },

  /**
   * Delete a file from the cloud
   * @param {string} publicId 
   * @param {string} resourceType 
   * @returns {Promise<any>}
   */
  deleteFile: async (publicId, resourceType = "image") => {
    if (!publicId) return;

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (err) {
      console.error(`❌ Failed to delete asset ${publicId} from cloud:`, err.message);
      // We don't throw here to avoid crashing the main process, but we log the error
    }
  },

  /**
   * Utility to delete multiple files (useful for cleanup hooks)
   * @param {Array<{ publicId: string, resourceType: string }>} files 
   */
  deleteMultipleFiles: async (files = []) => {
    if (!files.length) return;
    
    await Promise.allSettled(
      files.map((file) => storageService.deleteFile(file.publicId, file.resourceType))
    );
  }
};
