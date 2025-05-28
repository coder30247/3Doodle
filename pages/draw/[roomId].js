// pages/draw/[roomId].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import GameCanvas from '../../components/GameCanvas';
import Chat from '../../components/Chat';

let socket;

export default function DrawPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    socket = io('http://localhost:4000');
    setConnected(true);

    return () => socket.disconnect();
  }, [roomId]);

  if (!connected) return <p>Connecting...</p>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3 }}>
        <GameCanvas socket={socket} roomId={roomId} />
      </div>
      <div style={{ flex: 1 }}>
        <Chat socket={socket} roomId={roomId} />
      </div>
    </div>
  );
}
