import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to home after signup
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Sign Up</h1>
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
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
