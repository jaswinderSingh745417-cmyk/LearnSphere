import express from "express";
import {
  changePassword,
  getUser,
  Login,
  Logout,
  refreshToken,
  registerUser,
} from "../controller/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/refresh-token", refreshToken);
router.get("/profile ",isAuthenticated,getUser)
router.put("/change-password",isAuthenticated,changePassword)

export default router;
