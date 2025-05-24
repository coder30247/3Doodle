import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import RoomSettingsModal from '../components/RoomSettingsModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // toggle between login/signup

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>
        Welcome {user ? user.email : 'Guest'}
      </h1>

      {!user ? (
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
          <p style={{ textAlign: 'center' }}>
            {isLogin ? 'New user?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
            >
              {isLogin ? 'Signup' : 'Login'}
            </button>
          </p>
        </form>
      ) : (
        <>
          <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
            Logout
          </button>
          <RoomSettingsModal />
        </>
      )}
    </main>
  );
}
