import { useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { io } from "socket.io-client";
import { SocketContext } from "../lib/socket";

import { Auth_Context } from "../lib/Auth_Context";
import Login_Button from "./buttons/Login_Button";
import Signup_Button from "./buttons/Signup_Button";
import Guest_Login_Button from "./buttons/Guest_Login_Button";

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
        socketRef.current = null;
    });
    return socketRef.current;
};

export { initializeSocket };

export default function Login_Gate({ children }) {
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState(null);
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
        };
    }, []);

    const cleanupSocket = () => {
        if (socketRef.current) {
            console.log("Cleaning up socket:", socketRef.current.id);
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
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
                    <p className="text-lg text-gray-700">
                        Please log in to continue
                    </p>
                    <Login_Button />
                    <Signup_Button />
                    <Guest_Login_Button
                        loading={loading}
                        setLoginError={setLoginError}
                        setLoading={setLoading}
                    />
                </div>
            </div>
        );
    }

    return (
        <Auth_Context.Provider value={{ user, socket }}>
            <SocketContext.Provider value={socket}>
                {children}
            </SocketContext.Provider>
        </Auth_Context.Provider>
    );
}
