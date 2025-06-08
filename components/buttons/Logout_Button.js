import { signOut } from "firebase/auth";
import { auth } from "../../lib/Firebase.js";

export default function Logout_Button() {
    const handle_logout = async () => {
        try {
            await signOut(auth);
            alert("Logged out!");
        } catch (error) {
            console.error(`Logout error: ${error}`);
            alert("Error logging out.");
        }
    };

    return (
        <button
            onClick={handle_logout}
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
