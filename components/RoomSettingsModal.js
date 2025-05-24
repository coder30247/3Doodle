import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RoomSettingsModal() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/game/${code}`);
  }

  function joinRoom() {
    if (roomCode.trim()) {
      router.push(`/game/${roomCode.trim().toUpperCase()}`);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' }}>
      <button onClick={createRoom} style={{ padding: '0.5rem', backgroundColor: '#2563EB', color: 'white', borderRadius: '0.375rem' }}>
        🚪 Create Room
      </button>
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
      />
      <button onClick={joinRoom} style={{ padding: '0.5rem', backgroundColor: '#16A34A', color: 'white', borderRadius: '0.375rem' }}>
        🎮 Join Room
      </button>
    </div>
  );
}
