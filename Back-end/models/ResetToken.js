import mongoose from "mongoose";

const resetSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, expires: 300, default: Date.now } 
});

export default mongoose.model("ResetToken", resetSchema);
