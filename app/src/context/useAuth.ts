import { useContext } from "react";
import { AuthContext } from "./AuthContextDefaultValue";

export const useAuth = () => useContext(AuthContext);