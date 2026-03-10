import express from "express";
import jwt from "jsonwebtoken";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";
import { adminEmail, userEmail,updateUserTicketStatus, ticketAssignedToTeamTemplate, ticketAssignedToUserTemplate } from "../common/data.js";
const router = express.Router();

// Middleware to verify token
export function authMiddleware(req, res, next) {
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
    const admin = await User.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Verify team access
export const verifyTeam = async (req, res, next) => {
  try {
    if (req.user.role !== "teamMember") {
      return res.status(403).json({ message: "team access only" });
    }
    const admin = await User.findById(req.user.userId);
    if (!admin) return res.status(404).json({ message: "team not found" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Create new ticket
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, priority, description, date } = req.body;
    if(!title || !category || !description || !date){
      return res.status(400).json({ message: "All fields are required" });
    }
    const newTicket = new Ticket({
      userId: req.user.userId,
      title,
      category,
      priority,
      description,
      date
    });
    await newTicket.save();
    req.io.emit("ticket_created", newTicket);
    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
    queueMicrotask(async () => {
      try {
        //  Email to user
        const user = await User.findById(req.user.userId).lean();
        // Email to Admin
        const admin = await User.findOne({email:"011rgr@gmail.com"}).lean();
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
    const filter = req.query.filter;

    let query = { userId: req.user.userId };

    if (filter === "Closed") {
      query.status = "Closed";
    } else {
      query.status = { $in: ["Open", "In Progress"] };
    }
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments({ userId: req.user.userId, ...(query.status && { status: query.status }) })
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
    req.io.emit("ticket_updated", ticket);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Delete ticket
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Ticket.findOneAndDelete({ _id: id, userId: req.user.userId });
    req.io.emit("ticket_deleted", id);
    if (!result) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Ticket deleted successfully" });
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
// admin GET tickets by filter
router.get("/filter/:type", authMiddleware, verifyAdmin, async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
  

    let type = req.params.type;

    let filter = {};
   
    if (type !== "all") {
      filter.status = type;   // Open / Closed / In Progress
    }
    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tickets,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
});
//admin assign tickets to team members
router.post("/assign", authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { ticketId, memberId } = req.body;

    if (!ticketId || !memberId) {
      return res.status(400).json({ message: "Missing params" });
    }
    const updated = await Ticket.findByIdAndUpdate(
      ticketId,
      { assignedTo: memberId, assignedBy: req.user.userId,
        assignedAt: new Date(), status: "In Progress" },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");
       req.io.emit("ticket_assigned", updated);

    res.status(200).json({
      message: "Ticket assigned successfully",
      ticket: updated
    });
   queueMicrotask(async () => {
      try {
        //  EMAIL TO USER
        await sendMail(
          updated.userId.email,
          `Your Ticket #${updated._id} Has Been Assigned`,
          ticketAssignedToUserTemplate(
            updated.userId.name,
            updated
          )
        );

        // EMAIL TO TEAM MEMBER
        await sendMail(
          updated.assignedTo.email,
          `New Ticket Assigned: #${updated._id}`,
          ticketAssignedToTeamTemplate(
            updated.assignedTo.name,
            updated
          )
        );

      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ADMIN SUMMARY API
router.get("/admin/summary", authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "Open" });
    const progress = await Ticket.countDocuments({ status: "In Progress" });
    const closed = await Ticket.countDocuments({ status: "Closed" });
    const teamCount = await User.countDocuments({ role: "teamMember" });

    res.status(200).json({
      total,
      open,
      progress,
      closed,
      teamCount
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching counts", error });
  }
});
//  Team Member - Update Ticket Status
router.put("/:id/status", authMiddleware, verifyTeam, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "email name").lean();
    
req.io.emit("ticket_status_changed", updatedTicket); 
    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });
      res.json({ message: "Status updated", ticket: updatedTicket });
    queueMicrotask(async () => {
      try {
        await sendMail(
          updatedTicket.userId.email,
          "📢 Ticket Status Update – ' + updatedTicket.title",
          updateUserTicketStatus(updatedTicket,status)
        );
      } catch (err) {
           console.error("Background email failed:", err.message);
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// TEAM MEMBER – Get Assigned Tickets Only
router.get("/assigned/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teamMember") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const memberId = req.user.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find({ assignedTo: memberId })
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Ticket.countDocuments({ assignedTo: memberId })
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tickets
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
