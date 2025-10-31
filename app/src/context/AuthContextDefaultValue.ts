import { createContext } from "react";
import type { UserWithoutPassword } from "../types/user";

export interface AuthContextType {
    user: UserWithoutPassword | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);
