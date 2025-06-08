import { useRouter } from "next/router";

export default function Signup_Button() {
    const router = useRouter();
    return (
        <button
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            onClick={() => router.push("/signup")}
        >
            Sign Up
        </button>
    );
}
