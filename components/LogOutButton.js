import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Optional: redirect or UI feedback
            alert("Logged out!");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out.");
        }
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#DC2626",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
            }}
        >
            🔓 Logout
        </button>
    );
}
