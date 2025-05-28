import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';

export default function CreateRoomButton() {
  const router = useRouter();
  const { username, setIsHost, maxPlayers, setMaxPlayers } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  const [inputMaxPlayers, setInputMaxPlayers] = useState(maxPlayers || 4);
  const [error, setError] = useState('');

  const openPopup = () => {
    if (!username) {
      alert('Please enter a username before creating a room.');
      return;
    }
    setShowPopup(true);
  };

  const handleCreateRoom = () => {
    if (inputMaxPlayers < 2 || inputMaxPlayers > 10) {
      setError('Max players must be between 2 and 10');
      return;
    }
    setError('');
    setMaxPlayers(inputMaxPlayers);
    setIsHost(true);

    // Generate room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Save host info and maxPlayers to localStorage
    localStorage.setItem('isHost', 'true');
    localStorage.setItem('maxPlayers', inputMaxPlayers);

    setShowPopup(false);

    // Navigate to the room page
    router.push(`/game/${roomCode}`);
  };

  return (
    <>
      <button
        onClick={openPopup}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#2563EB',
          color: 'white',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          border: 'none',
          fontWeight: 'bold',
        }}
      >
        🚪 Create Room
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              minWidth: '300px',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginBottom: '1rem' }}>Enter max number of players (2 - 10)</h3>
            <input
              type="number"
              value={inputMaxPlayers}
              onChange={(e) => setInputMaxPlayers(Number(e.target.value))}
              min={2}
              max={10}
              style={{
                padding: '0.5rem',
                fontSize: '1rem',
                width: '100%',
                marginBottom: '1rem',
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
              }}
            />
            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
            <button
              onClick={handleCreateRoom}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563EB',
                color: 'white',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
                marginRight: '1rem',
              }}
            >
              Create
            </button>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ccc',
                color: 'black',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
