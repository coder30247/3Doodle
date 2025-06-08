import { signInAnonymously } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function Guest_Login_Button({ loading,setLoading, setLoginError }) {
    const handleGuestLogin = async () => {
        if (loading) return;
        setLoading(true);
        setLoginError(null);
        try {
            console.log("Attempting guest login");
            const result = await signInAnonymously(auth);
            console.log(
                "Guest login successful:",
                result.user.uid,
                result.user.isAnonymous
            );
        } catch (err) {
            console.error("Guest login failed:", err);
            setLoginError(`Guest login failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
            onClick={handleGuestLogin}
            disabled={loading}
        >
            {loading ? "Logging in..." : "Play as Guest"}
        </button>
    );
}
