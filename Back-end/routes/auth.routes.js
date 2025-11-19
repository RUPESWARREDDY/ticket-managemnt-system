import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import ResetToken from "../models/ResetToken.js";
import { sendMail } from "../utils/mailer.js";
import { verifyOtp } from "../common/data.js";
const router = express.Router();
//user registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role:"user",
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//admin and user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let account = await Admin.findOne({ email });
     if (!account) {
       account = await User.findOne({ email });
    }
    if (!account) {
      return res.status(400).json({ message: "  Email not Found" });
    }
    let role=account?.role
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Password Incorrect" });
     const token = jwt.sign(
      { userId: account._id, role },
        process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
 if (role === "admin") {
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: { name: account.name, email: account.email,role },
      });
    } else {
      return res.status(200).json({
        message: "User login successful",
        token,
        user: { name: account.name, email: account.email,role:role  },
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// user forgot password, verify otp and reset password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await ResetToken.findOneAndDelete({ email });
  await ResetToken.create({ email, otp });
  res.json({ "data": { message: "OTP sent to your email" } });
  queueMicrotask(async () => {
    try {
        await sendMail(email, "Password Reset Request - One-Time Passcode (OTP)", verifyOtp(otp));
       
  
    } catch (e) {
      console.log(e)
    }
  })

});
// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = await ResetToken.findOne({ email });
  if (!record || record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });
  res.json({ message: "OTP verified" });
});
// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate({ email }, { password: hashed });
  await ResetToken.findOneAndDelete({ email });

  res.json({ message: "Password reset successfully" });
});

export default router;
