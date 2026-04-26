import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    filedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },

    complainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complainer",
      required: true,
      index: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },

    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      index: true,
      required: true,
    },

    specification: {
      type: String,
      trim: true,
    },

    // ❗ Now optional (because voice complaint allowed)
    subject: {
      type: String,
      trim: true,
    },

    // ❗ Now optional (because voice complaint allowed)
    description: {
      type: String,
      trim: true,
    },

    /* 🎙️ Complaint Voice Note (MAIN VOICE) */
    voiceNote: {
      url: { type: String },
      format: { type: String },   // ex: audio/webm, audio/mpeg
      duration: { type: Number }, // seconds (optional)
      publicId: { type: String },
      resourceType: { type: String, default: "video" }
    },

    /* 📎 Complaint media (initial attachments) */
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "pdf", "audio"],
        },
        url: {
          type: String,
        },
        publicId: {
          type: String,
        },
        resourceType: {
          type: String,
          default: "image"
        }
      },
    ],

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
      index: true,
    },

    /* ================= CHAT / HISTORY ================= */
    history: [
      {
        message: {
          type: String,
          trim: true, // optional
        },

        media: [
          {
            type: {
              type: String,
              enum: ["image", "video", "pdf", "audio"],
            },
            url: {
              type: String,
            },
            publicId: {
              type: String,
            },
            resourceType: {
              type: String,
              default: "image"
            }
          },
        ],

        by: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "history.byModel",
        },

        byRole: {
          type: String,
          enum: ["user", "admin", "superadmin"],
          required: true,
        },

        byModel: {
          type: String,
          enum: ["AppUser", "Admin"],
          default: function () {
            return this.byRole === "user" ? "AppUser" : "Admin";
          },
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
