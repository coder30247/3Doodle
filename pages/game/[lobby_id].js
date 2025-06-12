import { useRouter } from "next/router";

export default function GameLoading() {
    const router = useRouter();
    const { lobby_id } = router.query;

    if (!user_id || !host_id || user_id !== host_id) return null;

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h1>Loading...</h1>
        </div>
    );
}