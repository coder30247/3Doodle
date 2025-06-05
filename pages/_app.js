// pages/_app.js
import { UserProvider } from "../context/UserContext";
import { SocketContext, socket } from "../lib/socket"; // ⬅️ import both

export default function App({ Component, pageProps }) {
    return (
        <UserProvider>
            <SocketContext.Provider value={socket}>
                <Component {...pageProps} />
            </SocketContext.Provider>
        </UserProvider>
    );
}
