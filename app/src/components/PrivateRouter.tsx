import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { JSX } from "react";

interface PrivateRouterProps{
    children: JSX.Element;
}

export const PrivateRouter = ({ children }: PrivateRouterProps) => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to={"/"} replace />;
};