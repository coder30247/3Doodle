import { createContext, useContext } from "react";

export const Auth_Context = createContext(null);

export function use_auth() {
    return useContext(Auth_Context);
}
