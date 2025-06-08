import { createContext, useContext } from "react";

export const Auth_Context = createContext(null);

export function useAuth() {
    return useContext(Auth_Context);
}
