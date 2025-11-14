import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { JSX } from "react";

interface PrivateRouterProps{
    children: JSX.Element;
    allowedRoles?: string[];
}

export const PrivateRouter = ({ children, allowedRoles }: PrivateRouterProps) => {
    const { isAuthenticated, user } = useAuth();

    if(!isAuthenticated) return <Navigate to="/login" replace />

    if(allowedRoles && user && !allowedRoles.includes(user.role)){
        switch (user.role){
            case "admin":
                return <Navigate to="/admin" replace />
            case "operador":
                return <Navigate to="/operador" replace />
            case "qualidade":
                return <Navigate to="/quality-dashboard" replace />
            case "engenharia":
                return <Navigate to="/engineering-dashboard" replace />
            case "tecnico_fundicao":
                return <Navigate to="/tec-fundicao" replace />
            case "tecnico_usinagem":
                return <Navigate to="/tec-usinagem" replace />
            default:
                return <Navigate to="/login" replace />
        }
    }

    return children
};