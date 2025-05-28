import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            setEmail("");
            setPassword("");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form
            onSubmit={handleAuth}
            className="flex flex-col gap-4 w-full max-w-sm mx-auto bg-white p-6 rounded shadow"
        >
            <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                {isLogin ? "Login" : "Sign Up"}
            </button>
            <p className="text-center text-sm text-gray-600">
                {isLogin ? "New user?" : "Already have an account?"}{" "}
                <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 hover:underline focus:outline-none"
                >
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </p>
        </form>
    );
}
