import express from "express";
import {
  getProfile,
  loginUser,
  registerUser,
  updatePassword,
} from "../Controllers/userControllers.js";
import auth from "../Middleware/auth.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getProfile);
router.put("/updatepassword", auth, updatePassword);
export default router;
