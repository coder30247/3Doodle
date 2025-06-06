import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { io } from "socket.io-client";
import { SocketContext } from "../lib/socket";

const initializeSocket = (currentUser, socketRef) => {
    if (!currentUser) {
        console.error("Attempted to initialize socket without user");
        return null;
    }
    if (socketRef.current) {
        console.log(
            "Socket already initialized, skipping:",
            socketRef.current.id
        );
        return socketRef.current;
    }
    console.log("Initializing Socket.IO for user:", currentUser.uid);
    socketRef.current = io("http://localhost:4000", {
        autoConnect: true,
        reconnection: false,
    });
    socketRef.current.on("connect", () => {
        console.log("Socket connected:", currentUser.uid, socketRef.current.id);
        socketRef.current.emit("auth", {
            firebaseUid: currentUser.uid,
            username:
                currentUser.displayName ||
                (currentUser.isAnonymous ? "Guest" : "User"),
        });
    });
    socketRef.current.on("error", (message) => {
        console.error("Socket error:", message);
    });
    socketRef.current.on("connect_error", (error) => {
        console.error("Socket connect error:", error.message);
    });
    socketRef.current.on("disconnect", (reason) => {
        console.log(
            "Socket disconnected:",
            socketRef.current?.id,
            "reason:",
            reason
        );
    });
    return socketRef.current;
};

export { initializeSocket };

export default function LoginGate({ children }) {
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState(null);
    const router = useRouter();
    const socketRef = useRef(null);

    useEffect(() => {
        console.log("Setting up auth listener");
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                console.log(
                    "onAuthStateChanged fired:",
                    currentUser
                        ? {
                              uid: currentUser.uid,
                              isAnonymous: currentUser.isAnonymous,
                          }
                        : null
                );
                if (currentUser) {
                    if (!user || user.uid !== currentUser.uid) {
                        setUser(currentUser);
                        if (!socketRef.current) {
                            // Only initialize if no socket exists
                            const newSocket = initializeSocket(
                                currentUser,
                                socketRef
                            );
                            setSocket(newSocket);
                        }
                    }
                } else {
                    setUser(null);
                    cleanupSocket();
                }
                setLoading(false);
            },
            (error) => {
                console.error("onAuthStateChanged error:", error);
                setLoading(false);
                setLoginError(error.message);
            }
        );

        return () => {
            console.log("Cleaning up auth listener");
            unsubscribe();
            cleanupSocket();
        };
    }, []);

    const cleanupSocket = () => {
        if (socketRef.current) {
            console.log("Cleaning up socket:", socketRef.current);
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
        }
    };

    const handleGuestLogin = async () => {
        if (loading) return;
        setLoading(true);
        setLoginError(null);
        try {
            console.log("Attempting guest login");
            const result = await signInAnonymously(auth);
            console.log(
                "Guest login successful:",
                result.user.uid,
                result.user.isAnonymous
            );
            setUser(result.user); // Socket handled by onAuthStateChanged
        } catch (err) {
            console.error("Guest login failed:", err);
            setLoginError(`Guest login failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);
        setLoginError(null);
        try {
            console.log("Attempting logout");
            await signOut(auth);
            console.log("User logged out");
            cleanupSocket();
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
            setLoginError(`Logout failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-gray-700">
                Loading...
            </div>
        );
    }

    if (loginError) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl text-red-700">
                Error: {loginError}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100">
                <h1 className="text-4xl font-bold text-blue-600">
                    Welcome to 3Doodle
                </h1>
                <div className="flex flex-col space-y-4 w-64">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                        onClick={() => router.push("/signup")}
                    >
                        Sign Up
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                        onClick={() => router.push("/login")}
                    >
                        Log In
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
                        onClick={handleGuestLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Play as Guest"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SocketContext.Provider value={socket}>
            {children({ user, socket, logout: handleLogout })}
        </SocketContext.Provider>
    );
}
