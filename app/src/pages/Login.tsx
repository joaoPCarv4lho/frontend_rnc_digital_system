import { useNavigate, Link } from "react-router-dom";
import type { UserLoginData } from "../types/user";
import { useAuth } from "../context/useAuth";
import { Input } from "../components/Input";
import { isAxiosError } from "axios";
import api from "../services/api";
import { useState } from "react";

export default function Login(){
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
            const response = await api.post("/auth/login", formData);
            if(response.status === 200 && response.data.access_token){
                await login(formData.email, formData.password);
                navigate("/rncs");
            }else{
                setMessage("Login failed. Please try again.");
            }
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                setMessage(error.response?.data?.detail || "Login failed. Please try again.");
                setError("Credenciais inválidas. Tente novamente.");
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
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Login</h1>
                {error && (<p className="text-red-500 text-center mb-4 text-sm">{error}</p>)}
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
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