import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

export default function JoinRoomForm() {
  const [roomCode, setRoomCode] = useState('');
  const { username, setIsHost } = useUser();
  const router = useRouter();

  const handleJoin = () => {
    if (!username) {
      alert('Please enter a username before joining a room.');
      return;
    }
    setIsHost(false);
    localStorage.setItem('isHost', false);
    router.push(`/game/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      <input
        type="text"
        placeholder="Room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '5px', flex: 1 }}
      />
      <button onClick={handleJoin} style={{ padding: '0.5rem' }}>
        🎮 Join
      </button>
    </div>
  );
}
