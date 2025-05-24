import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import RoomSettingsModal from '../components/RoomSettingsModal';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        Welcome {user ? user.email : 'Guest'}
      </h1>
      <RoomSettingsModal />
    </main>
  );
}
