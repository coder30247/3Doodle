// File: pages/game/[room_id].js
import { useRouter } from "next/router";
import Auth_Store from "../../states/Auth_Store";
import dynamic from "next/dynamic";

const TanksCanvas = dynamic(() => import("../../components/Tank_Canvas"), {
  ssr: false,
});

export default function GamePage() {
  const router = useRouter();
  const { room_id } = router.query;
  const { firebase_uid } = Auth_Store();

  if (!room_id || !firebase_uid) return <div>Loading game...</div>;

  return (
    <div className="w-full h-screen">
      <TanksCanvas room_id={room_id} firebaseUid={firebase_uid} />
    </div>
  );
}
