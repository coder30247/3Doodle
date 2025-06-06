import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            console.log("Attempting email login:", email);
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log("Email login successful:", result.user.uid);
            router.push("/"); // Socket handled by LoginGate.js
        } catch (err) {
            console.error("Email login failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">Log In</h1>
            <form
                onSubmit={handleLogin}
                className="flex flex-col space-y-4 w-80"
            >
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="px-4 py-2 border rounded-md"
                    disabled={loading}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="px-4 py-2 border rounded-md"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-green-300"
                    disabled={loading}
                >
                    {loading ? "Logging In..." : "Log In"}
                </button>
                {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
        </div>
    );
}
