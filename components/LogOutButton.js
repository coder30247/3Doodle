// components/LogoutButton.js
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out!');
    } catch (error) {
      alert(error.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
