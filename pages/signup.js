import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/Firebase.js";
import { set_user_id } from "../states/User_Store"; // <-- add this

export default function Signup() {
    const [email, set_email] = useState("");
    const [password, set_password] = useState("");
    const [loading, set_loading] = useState(false);
    const [error, set_error] = useState(null);
    const router = useRouter();

    const handle_signup = async (e) => {
        e.preventDefault();
        if (loading) return;
        set_loading(true);
        set_error(null);
        try {
            console.log(`Attempting signup with email: ${email}`);
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            console.log(`Signup successful: ${result.user.uid}`);
            set_user_id(result.user.uid); // <-- set user_id in Zustand
            router.push("/"); // redirect to home
        } catch (err) {
            console.error(`Signup failed: ${err}`);
            set_error(err.message);
        } finally {
            set_loading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">Sign Up</h1>
            <form
                onSubmit={handle_signup}
                className="flex flex-col space-y-4 w-80"
            >
                <input
                    type="email"
                    value={email}
                    onChange={(e) => set_email(e.target.value)}
                    placeholder="Email"
                    className="px-4 py-2 border rounded-md"
                    disabled={loading}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => set_password(e.target.value)}
                    placeholder="Password"
                    className="px-4 py-2 border rounded-md"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={loading}
                >
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
                {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
        </div>
    );
}