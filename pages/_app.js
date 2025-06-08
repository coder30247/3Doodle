import { User_Provider } from "../context/User_Context.js";
import { Socket_Context } from "../lib/Socket.js";

export default function App({ Component, page_props }) {
    return (
        <User_Provider>
            <Socket_Context.Provider value={null}>
                <Component {...page_props} />
            </Socket_Context.Provider>
        </User_Provider>
    );
}
