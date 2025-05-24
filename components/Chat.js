import { useEffect, useState } from "react";

export default function Chat({ socket, roomId }) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !roomId) {
      console.warn("[Chat] Socket or roomId missing:", { socket, roomId });
      return;
    }

    // Listen for chat messages
    socket.on("chatMessage", (data) => {
      console.log("[Chat] Received chatMessage:", data);
      setMessages((prev) => [...prev, data]);
    });

    // Handle chat errors
    socket.on("chatError", (error) => {
      console.error("[Chat] Chat error:", error);
    });

    return () => {
      socket.off("chatMessage");
      socket.off("chatError");
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (!socket) {
      console.warn("[Chat] Socket not connected!");
      return;
    }
    if (message.trim() === "" || username.trim() === "") {
      console.warn("[Chat] Empty message or username");
      return;
    }

    const messageData = { roomId, username, message };
    console.log("[Chat] Sending message:", messageData);
    socket.emit("chatMessage", messageData);
    setMessage("");
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3>Chat Room: {roomId || "Unknown"}</h3>
      <input
        type="text"
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ marginBottom: "0.5rem", width: "100%", padding: "0.5rem" }}
      />
      <button
        onClick={sendMessage}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      >
        Send
      </button>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "0.5rem",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center" }}>
            No messages yet...
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {messages.map((msg, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                <strong>{msg.username}:</strong> {msg.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}