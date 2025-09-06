import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5001");

function App() {
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  // ...existing code...
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [...prev, { system: true, text: `${data} joined the chat` }]);
    });

    socket.on("user_left", (data) => {
      setMessages((prev) => [...prev, { system: true, text: `${data} left the chat` }]);
    });

  // ...existing code...

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
  // ...existing code...
    };
  }, [username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = () => {
    if (!tempUsername) return;
    setUsername(tempUsername);
    setJoined(true);
    socket.emit("join_chat", tempUsername);
  };

  const sendMessage = () => {
    if (!message || !username) return;
    const data = { user: username, text: message };
    socket.emit("send_message", data);
  setMessage("");
  };

  // ...existing code...

  const leaveChat = () => {
    if (window.confirm("Are you sure you want to leave the chat?")) {
      socket.emit("leave_chat", username);
      setJoined(false);
      setUsername("");
      setMessages([]);
      // Do NOT clear users here; let backend send update_users event
    }
  };

  if (!joined) {
    return (
      <div className="chat-container">
        <h2 className="title">Join Chat</h2>
        <input
          className="input"
          placeholder="Enter username..."
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
        />
        <button className="send-btn" onClick={joinChat}>Join</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h2 className="title">Welcome, {username}</h2>


      <div className="chat-box">
        {messages.map((m, i) =>
          m.system ? (
            <p key={i} className="system-msg">{m.text}</p>
          ) : (
            <div
              key={i}
              className={`chat-bubble ${m.user === username ? "self" : "other"}`}
            >
              <span className="chat-user">{m.user}</span>
              <span className="chat-text">{m.text}</span>
            </div>
          )
        )}
        
      </div>

      <div className="input-row">
        <input
          className="input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button className="send-btn" onClick={sendMessage}>Send</button>
        <button className="leave-btn" onClick={leaveChat}>Leave</button>
      </div>
    </div>
  );
}

export default App;
