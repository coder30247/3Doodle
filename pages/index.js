import LoginGate from "../components/LoginGate";
import CreateLobbyButton from "../components/button/CreateLobbyButton";

export default function Home() {
    return (
        <LoginGate>
            {({ user, socket, logout }) => (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                    <h1 className="text-4xl font-bold text-blue-600">
                        3Doodle
                    </h1>
                    <CreateLobbyButton
                        username={
                            user.displayName ||
                            (user.isAnonymous ? "Guest" : "User")
                        }
                        socket={socket}
                        logout={logout}
                    />
                </div>
            )}
        </LoginGate>
    );
}
