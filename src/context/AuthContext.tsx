"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    username: string;
    is_admin?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, username: string, is_admin?: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        const storedIsAdmin = localStorage.getItem("is_admin") === "true";

        if (storedToken && storedUsername) {
            setToken(storedToken);
            setUser({ username: storedUsername, is_admin: storedIsAdmin });
        }
    }, []);

    const login = (newToken: string, username: string, is_admin: boolean = false) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("username", username);
        localStorage.setItem("is_admin", String(is_admin));
        setToken(newToken);
        setUser({ username, is_admin });
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("is_admin");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
