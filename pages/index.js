import Login_Gate from "../components/Login_Gate";
import CreateLobbyButton from "../components/buttons/CreateLobbyButton";
import { useAuth } from "../lib/Auth_Context";

function HomeContent() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">3Doodle</h1>
            <CreateLobbyButton
                username={
                    user.displayName || (user.isAnonymous ? "Guest" : "User")
                }
                logout={logout}
            />
        </div>
    );
}

export default function Home() {
    return (
        <Login_Gate>
            <HomeContent />
        </Login_Gate>
    );
}
