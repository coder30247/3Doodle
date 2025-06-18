import { useRouter } from "next/router";

export default function Login_Button() {
    const router = useRouter();
    return (
        <button
            className="button button_login"
            data-hover="Let’s Go!"
            onClick={() => router.push("/login")}
        >
            <span>Login</span>
        </button>
    );
}
