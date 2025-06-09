import Login_Gate from "../components/Login_Gate.js";
import Create_Lobby_Button from "../components/buttons/Create_Lobby_Button.js";
import Join_Lobby_Button from "../components/buttons/Join_Lobby_Button.js";
import Logout_Button from "../components/buttons/Logout_Button.js";
import Auth_Store from "../states/Auth_Store.js";
import User_Store from "../states/User_Store.js";

function Home_Content() {
    const { firebase_uid, is_authenticated } = Auth_Store();
    const { username } = User_Store();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">3Doodle</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
                Welcome, {username || (is_authenticated ? "User" : "Guest")}!
            </h2>
            <Create_Lobby_Button />
            <Join_Lobby_Button />
            <Logout_Button />
        </div>
    );
}

export default function Home() {
    return (
        <Login_Gate>
            <Home_Content />
        </Login_Gate>
    );
}
