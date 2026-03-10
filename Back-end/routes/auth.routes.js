import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import ResetToken from "../models/ResetToken.js";
import { sendMail } from "../utils/mailer.js";
import { teamCredentials, verifyOtp } from "../common/data.js";
const router = express.Router();
//user registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
     if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email:email.trim().toLowerCase(),
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
    let account = await User.findOne({ email:email.trim().toLowerCase() });
    if (!account) {
      return res.status(400).json({ message: "Email not Found" });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Password Incorrect" });
     const token = jwt.sign(
       {
         userId: account._id,
         role:account?.role
       },
        process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
       res.status(200).json({
        message: `${account.role} login successful`,
        token,
        user: { name: account.name, email: account.email,role:account?.role},
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//   ADMIN -> ADD TEAM MEMBER
router.post("/team/create", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const member = new User({
      name,
      email,
      password: hashed,
      role: "teamMember" 
    });

    await member.save();
     req.io.emit("team_member_created", member);
    res.json({ message: "Team member created successfully", member });
     queueMicrotask(async () => {
    try {
        await sendMail(email, "Your Account Credentials", teamCredentials(name,email,password));
    } catch (e) {
      console.log(e)
    }
  })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
//   ADMIN -> delete TEAM MEMBER
router.delete("/admin/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
// Unassign all tickets of this team member
    await Ticket.updateMany(
      { assignedTo: id },
      { $set: { assignedTo: null } }
    );

    // then Delete team member
    const result = await User.findByIdAndDelete(id);
     req.io.emit("team_member_deleted", id);
    if (!result) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({
      message: "Team member deleted. All assigned tickets are now unassigned."
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Admin -> get team members
router.get("/team", async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  
  const team = await User.find({ role: "teamMember" }).select("name email ")
    .skip(skip)
    .limit(limit)
    .lean();
  const total = await User.countDocuments({ role: "teamMember" }).lean(); 
// Fetch assigned count  
    const updatedTeam = await Promise.all(
      team.map(async (member) => {
        const assignedCount = await Ticket.countDocuments({ assignedTo: member._id });

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          assignedCount
        };
      })
    );
  res.json({
    members: updatedTeam,
    count: updatedTeam.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
   });
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
