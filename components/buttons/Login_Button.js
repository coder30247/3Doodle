import { useRouter } from "next/router";

export default function Login_Button() {
    const router = useRouter();
    return (
        <button
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            onClick={() => router.push("/login")}
        >
            Log In
        </button>
    );
}
