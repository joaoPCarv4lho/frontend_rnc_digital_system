import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContextDefaultValue";
import api from "../services/api";
import type { UserWithoutPassword } from "../types/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserWithoutPassword | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const loadStoredData = useCallback(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if(storedToken && storedUser){
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }else{
            setToken(null);
            setUser(null);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadStoredData();
        const handleStorageChange = (e: StorageEvent) => {
            if(["token", "user"].includes(e.key || "")){
                loadStoredData();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadStoredData]);

    const login = async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        const { access_token, user } = response.data;
        
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        setUser(user);
        setToken(access_token);
    };

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common["Authorization"];
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};