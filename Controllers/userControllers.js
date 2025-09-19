import User from "../Model/userSchema.js";
import { ErrorHandler } from "../Utils/error.js";
import { setToken } from "../Utils/setToken.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { getResetToken, hashPassword } from "../Utils/utility.js";
import sendEmail from "../Utils/sendEmail.js";
import { uploadImageToCloudinary } from "../Utils/uploadImage.js";
import Profile from "../Model/profileSchema.js";
const registerUser = async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body;
    if (!email && !password) {
      next(new ErrorHandler("Please Fill All Details", 400));
    }
    let user = await User.findOne({ name: name });
    let userEmail = await User.findOne({ email: email });
    if (userEmail) {
      next(new ErrorHandler("This Email Already Exist", 400));
    }
    if (user) {
      next(new ErrorHandler("This Full Name Already Exist", 400));
    }
    const bcrypt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, bcrypt);
    console.log(hashedPassword);
    user = await User.create({
      name: name,
      password: hashedPassword,
      email: email,
      role: role,
    });

    setToken(res, user, 200, "User Register");
  } catch (error) {
    next(error);
  }
};
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user) {
      return next(new ErrorHandler("Invalid User", 400));
    }
    const comparePassword = await bcryptjs.compare(password, user.password);
    if (!comparePassword) {
      return next(new ErrorHandler("Password Does Not Matched", 400));
    }

    setToken(res, user, 200, "SuccesFully Login");
  } catch (error) {
    next(error);
  }
};
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).lean();
    res.status(200).json({
      message: "success",
      user: {
        ...user,
      },
    });
  } catch (error) {
    next(error);
  }
};
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user).select("+password");
    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }
    // const comparePass = await user.comparePassword(oldPassword);
    const comparePass = await bcryptjs.compare(oldPassword, user.password);

    if (!comparePass) {
      return next(new ErrorHandler("Old Password is Incorrect", 400));
    }
    if (newPassword !== confirmNewPassword) {
      return next(new ErrorHandler("Password Does Not Matched", 400));
    }
    if (oldPassword === newPassword) {
      return next(
        new ErrorHandler("Old Password and New Password are Same", 400)
      );
    }
    const hashedPassword = await hashPassword(newPassword);
    console.log(hashedPassword);
    user.password = hashedPassword;
    await user.save();

    setToken(res, user, 200, "Password Updated SuccesFully");
  } catch (error) {
    next(error);
  }
};
const logout = (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }
    const { resetToken, resetExpiryPassword, resetPasswordToken } =
      await getResetToken();
    user.resetPasswordToken = resetPasswordToken;
    user.resetExpiryPassword = resetExpiryPassword;
    await user.save({ validateBeforeSave: true });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetLink} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        user: user.email,
        subject: "Reset Password",
        message,
      });
      res.status(200).json({
        user,
        message: "Email send Successfully",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetExpiryPassword = undefined;
      await user.save({ validateBeforeSave: true });
      res.status(400).json({
        message: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    console.log(token);
    const { password, confirmPassword } = req.body;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetExpiryPassword: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorHandler("Token is Invalid or Expired", 400));
    }
    if (password !== confirmPassword) {
      return next(new ErrorHandler("Password Does Not Matched", 400));
    }
    const hashedPassword = await hashPassword(password);
    (user.password = hashedPassword),
      (user.resetExpiryPassword = undefined),
      (user.resetPasswordToken = undefined);
    await user.save();
    setToken(res, user, 200, "Password Reset SuccesFully");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,

      learningGoals,
      preferredSubjects,
      bio,
      skills,
      hourlyRate,
      availability,
    } = req.body;

    const user = await User.findById(req.user);

    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadImageToCloudinary(req.file.buffer);
    // ✅ Update fields dynamically
    user.fullName = fullName || user.fullName;
    const commonFields = { phone, profilePic: result.secure_url };
    let profile;
    if (user.role === "learner") {
      profile = await Profile.create({
        user: user._id,
        ...commonFields,
        learningGoals,
        preferredSubjects,
      });
    }

    if (user.role === "tutor") {
      profile = await Profile.create({
        user: user._id,
        ...commonFields,
        bio,
        skills,
        hourlyRate,
        availability,
      });
    }

    // Mark as completed if major fields are filled

    await profile.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
};
