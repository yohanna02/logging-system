import { createContext, useState } from "react";

export const LoginContext = createContext({
    loginedIn: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setLoginedIn: (_: boolean) => {},
});


export default function LoginProvider({ children }: { children: React.ReactNode }) {
    const [loginedIn, setLoginedIn] = useState(false);

    return (
        <LoginContext.Provider value={{ loginedIn, setLoginedIn }}>
            {children}
        </LoginContext.Provider>
    );
}

