import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedIsHost = localStorage.getItem('isHost') === 'true';
    const storedMaxPlayers = parseInt(localStorage.getItem('maxPlayers'), 10);

    if (storedUsername) setUsername(storedUsername);
    if (storedIsHost) setIsHost(true);
    if (storedMaxPlayers && !isNaN(storedMaxPlayers)) setMaxPlayers(storedMaxPlayers);
  }, []);

  // Save to localStorage when changes
  useEffect(() => {
    if (username) localStorage.setItem('username', username);
    localStorage.setItem('isHost', isHost);
    localStorage.setItem('maxPlayers', maxPlayers);
  }, [username, isHost, maxPlayers]);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        isHost,
        setIsHost,
        maxPlayers,
        setMaxPlayers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
