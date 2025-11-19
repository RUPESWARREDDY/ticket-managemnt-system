import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "admin" }
});

const Admin = mongoose.model("Admin", adminSchema,"admin");
export default Admin;
