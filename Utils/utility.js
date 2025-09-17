import bcryptjs from "bcryptjs";
import crypto from "crypto";
const hashPassword = async function (password) {
  return await bcryptjs.hash(password, 10);
};

const getResetToken = async function () {
  const resetToken = await crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetExpiryPassword = Date.now() + 15 * 60 * 1000;
  return { resetToken, resetPasswordToken, resetExpiryPassword };
};

export { hashPassword, getResetToken };
