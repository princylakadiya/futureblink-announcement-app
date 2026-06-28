import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    announcement: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Announcement) {
  delete mongoose.models.Announcement;  // ← Yeh add karo
}

export default mongoose.model("Announcement", AnnouncementSchema);
