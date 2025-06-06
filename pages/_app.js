import { UserProvider } from "../context/UserContext";
import { SocketContext } from "../lib/socket";

export default function App({ Component, pageProps }) {
    return (
        <UserProvider>
            <SocketContext.Provider value={null}>
                <Component {...pageProps} />
            </SocketContext.Provider>
        </UserProvider>
    );
}
