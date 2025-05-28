import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to home after login
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Log In</h1>
      <div className="space-y-4 w-80">
        <input
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
          onClick={handleLogin}
        >
          Log In
        </button>
      </div>
    </div>
  );
}
