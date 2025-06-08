import Login_Gate from "../components/Login_Gate.js";
import Create_Lobby_Button from "../components/buttons/Create_Lobby_Button.js";
import Join_Lobby_Button from "../components/buttons/Join_Lobby_Button.js";
import Logout_Button from "../components/buttons/Logout_Button.js";
import { use_auth } from "../context/Auth_Context.js";

function Home_Content() {
    const { user } = use_auth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">3Doodle</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
                Welcome,{" "}
                {user.displayName || (user.isAnonymous ? "Guest" : "User")}!
            </h2>
            <Create_Lobby_Button
                username={
                    user.displayName || (user.isAnonymous ? "Guest" : "User")
                }
            />
            <Join_Lobby_Button
                username={
                    user.displayName || (user.isAnonymous ? "Guest" : "User")
                }
            />
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
