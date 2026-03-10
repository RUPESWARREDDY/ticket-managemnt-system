import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
dotenv.config();
const app = express();
// HTTP SERVER
const server = createServer(app);

//SOCKET.IO SERVER
export const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});


// SOCKET CONNECTION 
io.on("connection", (socket) => {
  console.log("✅ Socket Connected:", socket.id);
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("😥",err));

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`😊 Server running on http://localhost:${PORT}`);
});
