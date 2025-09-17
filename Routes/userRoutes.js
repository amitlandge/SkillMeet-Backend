import express from "express";
import {
  forgotPassword,
  getProfile,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updatePassword,
} from "../Controllers/userControllers.js";
import auth from "../Middleware/auth.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getProfile);
router.put("/updatepassword", auth, updatePassword);
router.get("/logout", auth, logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
export default router;
