// states/Auth_Store.js
import { create } from "zustand";

const Auth_Store = create((set) => ({
    firebase_uid: null,
    is_authenticated: false,

    set_firebase_uid: (uid) => set({ firebase_uid: uid }),
    set_is_authenticated: (val) => set({ is_authenticated: val }),
    reset_auth: () => set({ firebase_uid: null, is_authenticated: false }),
}));

// Helper functions for outside React
const set_user = (uid) => Auth_Store.getState().set_firebase_uid(uid);
const set_auth = (val) => Auth_Store.getState().set_is_authenticated(val);
const clear_user = () => Auth_Store.getState().reset_auth();

export default Auth_Store;
export { set_user, set_auth, clear_user };
