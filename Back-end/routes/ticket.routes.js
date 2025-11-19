import express from "express";
import jwt from "jsonwebtoken";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { sendMail, scheduleDelete } from "../utils/mailer.js";
import { adminEmail, userEmail,updateUserTicketStatus } from "../common/data.js";
import { getIO } from "../socket.js";
const router = express.Router();

// Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

// Verify admin access
export const verifyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const admin = await Admin.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Create new ticket
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, priority, description, date } = req.body;

    const newTicket = new Ticket({
      userId: req.user.userId,
      title,
      category,
      priority,
      description,
      date
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
    // Emit socket event for created ticket (populate user email for admin view)
    try {
      const io = getIO();
      if (io) {
        const populated = await Ticket.findById(newTicket._id).populate("userId", "email").lean();
        io.emit("ticketCreated", populated);
      }
    } catch (e) {
      console.error("Socket emit error (create):", e);
    }
    queueMicrotask(async () => {
      try {
        //  Email to user
        const user = await User.findById(req.user.userId).lean();
        // Email to Admin
        const admin = await Admin.findOne({}).lean();
        await Promise.allSettled([
          user ? sendMail(
            user.email,
            '🎫 Ticket Confirmation – Your Support Request Has Been Created',
              userEmail(user,title)
          ) : Promise.resolve(),
          admin ? sendMail(
            admin.email,
            '📩 New Ticket Created – Action Required',
            adminEmail(user,title)
          ) : Promise.resolve()
        ]);
      } catch (e) {
        console.error('Post-response email error:', e);
      }
    })
  }
  catch (err) {
      res.status(500).json({ message: err.message });
    }
});

//  Get all tickets for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7 ;
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      Ticket.find({ userId: req.user.userId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments({ userId: req.user.userId })
    ]);
    res.json({ page, limit, total, totalPages: Math.ceil(total / limit), tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Update ticket
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json(ticket);
    // Emit ticket updated event
    try {
      const io = getIO();
      if (io) {
        const populated = await Ticket.findById(ticket._id).populate("userId", "email").lean();
        io.emit("ticketUpdated", populated);
      }
    } catch (e) {
      console.error("Socket emit error (update):", e);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Delete ticket
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Ticket.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!result) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Ticket deleted successfully" });
    // Emit ticket deleted event
    try {
      const io = getIO();
      if (io) io.emit("ticketDeleted", { _id: id });
    } catch (e) {
      console.error("Socket emit error (delete):", e);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin - Get All Tickets
router.get("/all", authMiddleware, verifyAdmin, async (req, res) => {
  try {
     let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
      const total = await Ticket.countDocuments(); 

    const tickets = await Ticket.find().populate("userId", "email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 });
     res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Admin - Update Ticket Status
router.put("/:id/status", authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "email name").lean();
    
    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });
      res.json({ message: "Status updated", ticket: updatedTicket });
      // Emit ticket updated event for admins and users
      try {
        const io = getIO();
        if (io) io.emit("ticketUpdated", updatedTicket);
      } catch (e) {
        console.error("Socket emit error (status update):", e);
      }
    queueMicrotask(async () => {
      try {
        await sendMail(
          updatedTicket.userId.email,
          "📢 Ticket Status Update – ' + updatedTicket.title",
          updateUserTicketStatus(updatedTicket,status)
        );
         if (status === "Closed") {
          scheduleDelete(
            updatedTicket._id,
            updatedTicket.userId.email,
            updatedTicket
          );
        }
      } catch (err) {
           console.error("Background email failed:", err.message);
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
