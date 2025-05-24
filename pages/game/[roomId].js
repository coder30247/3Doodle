import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { initSocket } from '../../lib/socket';

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const socketInstance = initSocket();
    setSocket(socketInstance);

    socketInstance.emit('join-room', roomId);

    socketInstance.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', { text: 'Hello from 3Doodle!' });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎨 Room: {roomId}</h2>
      <button onClick={sendMessage}>Send Test Message</button>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg.text}</p>
        ))}
      </div>
    </div>
  );
}
