import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/Firebase.js";
import styled from "styled-components";
import GridBg from "../components/frontend/GridBg.jsx";

export default function Signup() {
    const [email, set_email] = useState("");
    const [password, set_password] = useState("");
    const [loading, set_loading] = useState(false);
    const [error, set_error] = useState(null);
    const router = useRouter();

    const handle_signup = async (e) => {
        e.preventDefault();
        if (loading) return;
        set_loading(true);
        set_error(null);
        try {
            console.log(`Attempting signup with email: ${email}`);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log(`Signup successful: ${result.user.uid}`);
            router.push("/");
        } catch (err) {
            console.error(`Signup failed: ${err}`);
            set_error(err.message);
        } finally {
            set_loading(false);
        }
    };

    return (
        <StyledWrapper className="relative flex justify-center items-center min-h-screen">
            <div className="absolute inset-0 z-0">
                <GridBg />
            </div>
            <form className="form z-10" onSubmit={handle_signup}>
                <div className="title">
                    Join Us,<br />
                    <span>create your account</span>
                </div>
                <input
                    className="input"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => set_email(e.target.value)}
                    disabled={loading}
                />
                <input
                    className="input"
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => set_password(e.target.value)}
                    disabled={loading}
                />
                <div className="login-with">
                    <div className="button-log"><b>t</b></div>
                    <div className="button-log">
                        {/* Google Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 56.6934 56.6934">
                            <path d="M51.981,24.4812c-7.7173-0.0038-15.4346-0.0019-23.1518-0.001c0.001,3.2009-0.0038,6.4018,0.0019,9.6017  c4.4693-0.001,8.9386-0.0019,13.407,0c-0.5179,3.0673-2.3408,5.8723-4.9258,7.5991c-1.625,1.0926-3.492,1.8018-5.4168,2.139  c-1.9372,0.3306-3.9389,0.3729-5.8713-0.0183c-1.9651-0.3921-3.8409-1.2108-5.4773-2.3649  c-2.6166-1.8383-4.6135-4.5279-5.6388-7.5549c-1.0484-3.0788-1.0561-6.5046,0.0048-9.5805  c0.7361-2.1679,1.9613-4.1705,3.5708-5.8002c1.9853-2.0324,4.5664-3.4853,7.3473-4.0811c2.3812-0.5083,4.8921-0.4113,7.2234,0.294  c1.9815,0.6016,3.8082,1.6874,5.3044,3.1163c1.5125-1.5039,3.0173-3.0164,4.527-4.5231c0.7918-0.811,1.624-1.5865,2.3908-2.4196  c-2.2928-2.1218-4.9805-3.8274-7.9172-4.9056C32.0723,4.0363,26.1097,3.995,20.7871,5.8372  C14.7889,7.8907,9.6815,12.3763,6.8497,18.0459c-0.9859,1.9536-1.7057,4.0388-2.1381,6.1836  C3.6238,29.5732,4.382,35.2707,6.8468,40.1378c1.6019,3.1768,3.8985,6.001,6.6843,8.215c2.6282,2.0958,5.6916,3.6439,8.9396,4.5078  c4.0984,1.0993,8.461,1.0743,12.5864,0.1355c3.7284-0.8581,7.256-2.6397,10.0725-5.24c2.977-2.7358,5.1006-6.3403,6.2249-10.2138  C52.5807,33.3171,52.7498,28.8064,51.981,24.4812z" />
                        </svg>
                    </div>
                    <div className="button-log">
                        {/* Facebook Icon */}
                        <svg className="icon" height="56.693px" viewBox="0 0 56.693 56.693">
                            <path d="M40.43,21.739h-7.645v-5.014c0-1.883,1.248-2.322,2.127-2.322c0.877,0,5.395,0,5.395,0V6.125l-7.43-0.029  c-8.248,0-10.125,6.174-10.125,10.125v5.518h-4.77v8.53h4.77c0,10.947,0,24.137,0,24.137h10.033c0,0,0-13.32,0-24.137h6.77  L40.43,21.739z" />
                        </svg>
                    </div>
                </div>
                <button
                    type="submit"
                    className="button-confirm"
                    disabled={loading}
                >
                    {loading ? "Signing Up..." : "Let's go →"}
                </button>
                {error && <p className="error">{error}</p>}
            </form>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: relative;

  .form {
    --input-focus: #000000;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: beige;
    --main-color: black;
    padding: 20px;
    background: lightblue;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
  }

  .title {
    color: var(--font-color);
    font-weight: 900;
    font-size: 20px;
    margin-bottom: 25px;
  }

  .title span {
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 17px;
  }

  .input {
    width: 250px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
  }

  .input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .input:focus {
    border: 2px solid var(--input-focus);
    transform: translateY(4px);
    box-shadow: 1px 2px 0px 0px #000000;
  }

  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-with {
    display: flex;
    gap: 20px;
  }

  .button-log {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    color: var(--font-color);
    font-size: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    width: 24px;
    height: 24px;
    fill: var(--main-color);
  }

  .button-log:active,
  .button-confirm:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }

  .button-confirm {
    margin: 50px auto 0 auto;
    width: 120px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
  }

  .button-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--bg-color);
  }

  .error {
    color: red;
    font-size: 14px;
    text-align: center;
    width: 100%;
  }
`;
