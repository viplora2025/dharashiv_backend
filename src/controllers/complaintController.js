import Complaint from "../models/complaintModel.js";
import AppUser from "../models/appUserModel.js";
import Complainer from "../models/complainerModel.js";
import Counter from "../models/counterModel.js";
import Village from "../models/villageModel.js";

// Helper to generate Custom Complaint ID
// Format: CMP-{AppUserLast4}-{ComplainerLast4}-{Sequence}
// e.g. CMP-A1B2-C3D4-001
const generateComplaintId = async (filedById, complainerRefId) => {
    // Get last 4 chars of the ObjectIds (or use custom string IDs if available)
    // For robustness, let's fetch the actual documents to get their custom string IDs.
    const appUser = await AppUser.findById(filedById);
    const complainer = await Complainer.findById(complainerRefId);

    // Use custom ID if available, else fallback to ObjectId string
    const userStr = appUser?.appUserId || filedById.toString();
    const compStr = complainer?.complainerId || complainerRefId.toString();

    const userPart = userStr.slice(-4);
    const compPart = compStr.slice(-4);

    // Increment sequence
    const counter = await Counter.findByIdAndUpdate(
        "complaintId",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const seq = counter.seq.toString().padStart(3, "0");

    return `CMP-${userPart}-${compPart}-${seq}`.toUpperCase();
};

// CREATE Complaint
export const createComplaint = async (req, res) => {
    try {
        const { complainer, village, department, subDepartment, subject, description } = req.body;
        // Auto-fill filedBy from token
        const filedBy = req.body.filedBy || req.user?._id;

        if (!filedBy || !complainer || !village || !department || !subDepartment || !subject || !description) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        // Process uploaded files
        let mediaFiles = [];
        if (req.files && req.files.length > 0) {
            mediaFiles = req.files.map(file => {
                let type = "image"; // default
                const mime = file.mimetype;
                if (mime.includes("video")) type = "video";
                else if (mime.includes("pdf")) type = "pdf";
                else if (mime.includes("audio")) type = "audio";

                // Construct URL (assuming server is serving 'uploads' static folder)
                // You might need to prepend base URL in frontend or here
                return {
                    type,
                    url: `/api/uploads/${file.filename}`
                };
            });
        }

        const complaintId = await generateComplaintId(filedBy, complainer);

        const newComplaint = await Complaint.create({
            complaintId,
            filedBy,
            complainer,
            village,
            department,
            subDepartment,
            subject,
            description,
            media: mediaFiles,
            history: [
                {
                    message: "Complaint registered",
                    by: filedBy,
                    timestamp: new Date()
                }
            ]
        });

        res.status(201).json({ message: "Complaint created successfully", complaint: newComplaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// GET ALL Complaints (with filters)
export const getAllComplaints = async (req, res) => {
    try {
        const { status, village, department, subDepartment, taluka, filedBy } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (department) filter.department = department;
        if (subDepartment) filter.subDepartment = subDepartment;
        if (filedBy) filter.filedBy = filedBy;

        // Village Filter Logic (Specific village OR all villages in a taluka)
        if (village) {
            filter.village = village;
        } else if (taluka) {
            // Find all villages in this taluka
            const villages = await Village.find({ taluka }).select("_id");
            const villageIds = villages.map(v => v._id);
            filter.village = { $in: villageIds };
        }

        const complaints = await Complaint.find(filter)
            .populate("filedBy", "name phone appUserId")
            .populate("complainer", "name phone complainerId")
            .populate("village", "name")
            .populate("department", "name")
            .populate("subDepartment", "name")
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Single Complaint
export const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id)
            .populate("filedBy", "name phone appUserId")
            .populate("complainer", "name phone complainerId")
            .populate("village", "name")
            .populate("department", "name")
            .populate("subDepartment", "name");

        if (!complaint) return res.status(404).json({ message: "Complaint not found" });

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Status
export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, message, updatedBy } = req.body; // updatedBy = AppUser ID (official)

        if (!status) return res.status(400).json({ message: "Status is required" });

        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: "Complaint not found" });

        complaint.status = status;

        // Add history entry
        if (message || updatedBy) {
            complaint.history.push({
                message: message || `Status changed to ${status}`,
                by: updatedBy || null, // Optional if system update
                timestamp: new Date()
            });
        }

        await complaint.save();

        res.json({ message: "Complaint status updated", complaint });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Public Tracking for Offline Complainers
 * Input: Custom String ID (complaintId) e.g. "CMP-A1B2-C3D4-001"
 */
export const trackComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        // Find by the Custom String ID, NOT the ObjectId
        const complaint = await Complaint.findOne({ complaintId })
            .select("complaintId status history subject description createdAt updatedAt") // Select limited fields for privacy
            .populate("department", "name")
            .populate("subDepartment", "name")
            .populate("village", "name");

        if (!complaint) return res.status(404).json({ message: "Complaint not found. Please check the ID." });

        res.json(complaint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get all complaints filed by a specific AppUser
 */
export const getComplaintsByAppUser = async (req, res) => {
    try {
        const { appUserId } = req.params; // Expecting the AppUser's _id or appUserId

        let filter = {};
        // Check if it's a valid ObjectId, if so assume _id, else lookup by appUserId string
        if (appUserId.match(/^[0-9a-fA-F]{24}$/)) {
            filter.filedBy = appUserId;
        } else {
            const user = await AppUser.findOne({ appUserId });
            if (!user) return res.status(404).json({ message: "AppUser not found" });
            filter.filedBy = user._id;
        }

        const complaints = await Complaint.find(filter)
            .populate("complainer", "name") // Just show name
            .populate("department", "name")
            .populate("subDepartment", "name")
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
