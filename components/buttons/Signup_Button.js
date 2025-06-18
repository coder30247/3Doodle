import { useRouter } from "next/router";

export default function Signup_Button() {
    const router = useRouter();
    return (
        <button
            className="button button_signup"
            data-hover="Join Us!"
            onClick={() => router.push("/signup")}
        >
            <span>Sign Up</span>
        </button>
    );
}
