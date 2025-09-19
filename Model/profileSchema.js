import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profilePic: {
      type: String, // URL to uploaded image (Cloudinary, S3, etc.)
      default: "",
    },
    phone: { type: String },

    // Learner fields
    learningGoals: { type: String },
    preferredSubjects: { type: String },

    // Tutor fields
    bio: { type: String },
    skills: { type: String },
    hourlyRate: { type: Number },
    availability: { type: String },

    // Profile completion flag
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
