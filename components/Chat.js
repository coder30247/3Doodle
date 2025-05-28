// Chat.js
import React, { useState, useEffect, useRef } from "react";

const CircularWordButtonsPopup = ({ words, radius = 80, username, onWordClick }) => {
  const [visible, setVisible] = useState(false);
  const togglePopup = () => setVisible(v => !v);
  const angleStep = (2 * Math.PI) / words.length;

  return (
    <div style={{ position: "relative", display: "inline-block", margin: 20 }}>
      <button
        onClick={togglePopup}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          backgroundColor: "#4a90e2",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
          userSelect: "none",
        }}
        title={`Click to toggle words for ${username}`}
      >
        {username}
      </button>

      {visible && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: radius * 2,
            height: radius * 2,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {words.map((word, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x = radius + radius * Math.cos(angle) - 40 / 2;
            const y = radius + radius * Math.sin(angle) - 25 / 2;

            return (
              <button
                key={i}
                onClick={() => onWordClick(word, username)}
                style={{
                  position: "absolute",
                  top: y,
                  left: x,
                  width: 40,
                  height: 25,
                  borderRadius: 12,
                  backgroundColor: "#f39c12",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  userSelect: "none",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Chat({ socket, roomId }) {
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Replace this list with your own words or fetch dynamically
  const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"];

  useEffect(() => {
    if (!socket) return;

    // Listen for player list updates
    socket.on("updatePlayers", (players) => {
      setPlayers(players);
    });

    // Listen for chat messages
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Clean up on unmount
    return () => {
      socket.off("updatePlayers");
      socket.off("chatMessage");
    };
  }, [socket]);

  // Send chat message
  const sendMessage = () => {
    if (!input.trim()) return;
    const username = localStorage.getItem("username") || "Anonymous";

    socket.emit("chatMessage", {
      roomId,
      username,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setInput("");
  };

  // Handle clicking a word in the popup
  const handleWordClick = (word, username) => {
    alert(`User ${username} clicked word: ${word}`);
    // You can also emit this event to server if you want
    // socket.emit("wordSelected", { roomId, username, word });
  };

  // Styling for messages: different color if sent by current user
  const currentUsername = localStorage.getItem("username") || "Anonymous";

  return (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 500 }}>
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 20 }}>
        {players.map((player) => (
          <CircularWordButtonsPopup
            key={player.id}
            username={player.username}
            words={words}
            radius={80}
            onWordClick={handleWordClick}
          />
        ))}
      </div>

      <div
        style={{
          flexGrow: 1,
          height: 250,
          border: "1px solid #ccc",
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 5,
              textAlign: msg.username === currentUsername ? "right" : "left",
              color: msg.username === currentUsername ? "#1a73e8" : "#333",
              fontWeight: msg.username === currentUsername ? "bold" : "normal",
            }}
          >
            <small>
              {msg.username} {msg.timestamp}
            </small>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          style={{ flexGrow: 1, padding: 8 }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 10, padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
