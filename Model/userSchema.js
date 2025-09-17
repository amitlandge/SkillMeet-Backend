import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["tutor", "learner"],
    default: "learner",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetExpiryPassword: Date,
});
const User = mongoose.model("User", userSchema);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.getResetToken = async function () {
  const resetToken = await crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetExpiryPassword = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
export default User;
