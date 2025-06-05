import LoginGate from "../components/LoginGate";
import UserHeader from "../components/UserHeader";
import LogoutButton from "../components/button/LogoutButton";
import Lobby_Menu from "../components/Lobby_Menu";

export default function Home() {
    return (
        <LoginGate>
            {({ user }) => (
                <main className="flex flex-col items-center mt-20 space-y-6">
                    <h1 className="text-3xl font-bold text-blue-600">
                        Welcome to the Chat App
                    </h1>
                    <UserHeader user={user} />
                    <LogoutButton />
                    <Lobby_Menu />
                </main>
            )}
        </LoginGate>
    );
}
