import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import RoomSettingsModal from "../components/RoomSettingsModal";
import UserHeader from "../components/UserHeader";
import AuthForm from "../components/AuthForm";
import LogoutButton from "../components/LogoutButton";

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <main
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "5rem",
            }}
        >
            <UserHeader user={user} />
            {!user ? (
                <AuthForm />
            ) : (
                <>
                    <LogoutButton />
                    <RoomSettingsModal />
                </>
            )}
        </main>
    );
}
