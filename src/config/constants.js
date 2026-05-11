export const UserRoles = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
  SUPERADMIN: "superadmin"
};

export const EventStatus = {
  ANNOUNCED: "Announced",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

export const VisitorStatus = {
  REGISTERED: "Registered",
  IN_PROGRESS: "InProgress",
  VISITED: "Visited",
  ABSENT: "Absent"
};

export const RegistrationType = {
  ONLINE: "Online",
  OFFLINE: "Offline"
};

// Predefined announcement type codes with bilingual labels.
// Admin can send a code (e.g. "MEETING", "SABHA") and it will be resolved
// to {en, mr} automatically. For custom labels, send {en, mr} explicitly.
export const AnnouncementType = {
  MEETING:        { en: "Meeting",        mr: "मीटिंग" },
  SABHA:          { en: "Sabha",          mr: "सभा" },
  PUBLIC_NOTICE:  { en: "Public Notice",  mr: "सार्वजनिक सूचना" },
  KENDRA:         { en: "Kendra",         mr: "केंद्र" },
  EVENT:          { en: "Event",          mr: "कार्यक्रम" },
  ANNOUNCEMENT:   { en: "Announcement",   mr: "घोषणा" },
  NOTIFICATION:   { en: "Notification",   mr: "सूचना" },
  NEWS:           { en: "News",           mr: "बातमी" },
  URGENT:         { en: "Urgent",         mr: "तातडीचे" },
  IMPORTANT:      { en: "Important",      mr: "महत्त्वाचे" },
  GENERAL:        { en: "General",        mr: "सामान्य" }
};

// Normalize an arbitrary string to an AnnouncementType key
// (e.g. "join meeting" -> "JOIN_MEETING", "Sabha" -> "SABHA").
export const normalizeAnnouncementTypeKey = (val) =>
  typeof val === "string"
    ? val.trim().toUpperCase().replace(/[\s-]+/g, "_")
    : "";

// Resolve an input (string code or {en, mr}) to a bilingual label.
// Returns null if the input cannot be resolved.
export const resolveAnnouncementType = (val) => {
  if (val && typeof val === "object" && val.en && val.mr) {
    return { en: String(val.en).trim(), mr: String(val.mr).trim() };
  }
  if (typeof val === "string") {
    const key = normalizeAnnouncementTypeKey(val);
    if (AnnouncementType[key]) return { ...AnnouncementType[key] };
  }
  return null;
};
