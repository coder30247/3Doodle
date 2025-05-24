import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function GameRoom() {
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    console.log('Joined room:', roomId);
  }, [roomId]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem' }}>🎨 Welcome to Room: {roomId}</h1>
      <p>This is where the game will happen.</p>
    </div>
  );
}
