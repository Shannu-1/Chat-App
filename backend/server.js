const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_chat", (username) => {
    io.emit("user_joined", username);
    socket.username = username;
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("leave_chat", (username) => {
    io.emit("user_left", username);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("user_left", socket.username);
    }
  });
});

server.listen(5001);
