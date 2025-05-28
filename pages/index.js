import LoginGate from "../components/LoginGate";
import UserHeader from "../components/UserHeader";
import LogoutButton from "../components/LogoutButton";
import Room_Menu from "../components/Room_Menu";

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
                    <Room_Menu />
                </main>
            )}
        </LoginGate>
    );
}
