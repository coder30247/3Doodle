import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

export default function LoginGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      alert("Guest login failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600">Welcome to 3Doodle</h1>
        <div className="flex flex-col space-y-4 w-64">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            onClick={() => router.push("/login")}
          >
            Log In
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
            onClick={handleGuestLogin}
          >
            Play as Guest
          </button>
        </div>
      </div>
    );
  }

  return children({ user });
}
