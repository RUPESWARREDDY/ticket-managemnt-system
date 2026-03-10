import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
    default: "Open",
  },
  date: { type: Date, required: true },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
