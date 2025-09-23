import express from "express";
import {
  forgotPassword,
  getCompleteProfile,
  getProfile,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../Controllers/userControllers.js";
import auth from "../Middleware/auth.js";
import upload from "../Middleware/multer.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getProfile);
router.put("/updatepassword", auth, updatePassword);
router.get("/logout", auth, logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
router.post("/createprofile", auth, upload.single("profilePic"), updateProfile);
router.get("/getcompleteprofile", auth, getCompleteProfile);
export default router;
