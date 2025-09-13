import User from "../Model/userSchema.js";
import { ErrorHandler } from "../Utils/error.js";
import { setToken } from "../Utils/setToken.js";
import bcryptjs from "bcryptjs";
import { hashPassword } from "../Utils/utility.js";
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

export { registerUser, loginUser, getProfile, updatePassword };
