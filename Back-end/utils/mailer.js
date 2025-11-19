import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Ticket from "../models/Ticket.js";
import { ticketDeleted } from "../common/data.js";
dotenv.config();
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
     minVersion: "TLSv1"
  }
});
export const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};
export const scheduleDelete = async (ticketId, userEmail, updatedTicket) => {
  await sendMail(
          userEmail,
          `🗑️ Ticket Deleted –  + ${updatedTicket?.status}`,
          ticketDeleted(updatedTicket)
        );
  setTimeout(async () => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (ticket && ticket.status === "Closed") {
        await Ticket.findByIdAndDelete(ticketId);
        
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  },  10000); //86400000 24hours 3600000//1 hour
};

