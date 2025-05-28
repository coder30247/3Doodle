import { useUser } from '../context/UserContext';
import { useState } from 'react';

export default function UsernameInput() {
  const { setUsername } = useUser();
  const [input, setInput] = useState('');

  const handleSet = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setUsername(trimmed);
      localStorage.setItem('username', trimmed);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="text"
        placeholder="Enter username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: '0.5rem', borderRadius: '5px', flex: 1 }}
      />
      <button onClick={handleSet} style={{ padding: '0.5rem' }}>
        Set
      </button>
    </div>
  );
}
