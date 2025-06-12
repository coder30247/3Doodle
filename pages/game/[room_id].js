import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const TanksCanvas = dynamic(() => import("../../components/Tank_Canvas"), {
  ssr: false,
});

export default function GamePage() {
  const { room_id } = useRouter().query;

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <TanksCanvas room_id={room_id} />
    </div>
  );
}