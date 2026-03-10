import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
     required: function() {
      return this.role !== "admin"; 
    },
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "teamMember"],
    default: "user",
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
