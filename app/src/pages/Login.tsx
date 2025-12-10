import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useState } from "react";

import logo from "../../public/SmartTrace.png"
import { Input } from "../components/Input";

import type { UserLoginData } from "../types/user";
import { useAuth } from "../context/useAuth";


export default function LoginPage(){
    const [formData, setFormData] = useState<UserLoginData>({
        email: "",
        password: ""
    });

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevForm => ({
            ...prevForm,
            [name]: value 
        }));
    }

    async function handleSubmit(event: React.FormEvent){
        event.preventDefault();
        setLoading(true);
        try{
            await login(formData.email, formData.password)

            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

            switch(storedUser.role){
                case "operador":
                    navigate("/operador");
                    break;
                case "admin":
                    navigate("/admin");
                    break;
                case "qualidade":
                    navigate("/quality-dashboard");
                    break;
                case "engenharia":
                    navigate("/engineering-dashboard");
                    break;
                case "tecnico":
                    navigate("/technical");
                    break;
                default:
                    navigate("/");
            }
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                setMessage(error.response?.data?.detail || "Login failed. Please try again.");
                setError("Credenciais inválidas. Tente novamente.");
                console.log(error.response);
            } else if (error instanceof Error) {
                setMessage(error.message);
                setError(error.message);
            } else {
                setMessage("Login failed. Please try again.");
                setError("Credenciais inválidas. Tente novamente.");
            }
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-500">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-96">
                <div className="flex flex-col items-center mb">
                    <img src={logo} alt="Logo SmartTrace" className="w-28 mb-2 drop-shadow-sm" />
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Login</h1>
                </div>
                {error && (<p className="text-red-500 text-center mb-4 text-sm">{error}</p>)}
                <Input label="Matricula" name="registration" type="text" value={formData.email} onChange={handleChange} required />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                    {loading ? "Logging in..." : "Login"}
                </button>
                {message && (<p className={`mt-4 text-center ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>)}
                <p className="text-sm text-center mt-4">
                    Não tem conta?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </form>
        </div>
    );
}