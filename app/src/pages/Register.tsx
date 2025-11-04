import { useState } from "react";
import api from "../services/api";
import { isAxiosError } from "axios";
import type { UserRegisterData } from "../types/user";
import { Input } from "../components/Input";

export default function RegisterPage(){
    const [formData, setFormData] = useState<UserRegisterData>({
        name: "",
        email: "",
        password: "",
        role: "operador",
        active: true
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const response = await api.post("/user/register", formData);
            if(response.status === 201){
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "operador",
                    active: true
                });
                setMessage("User registered successfully!");
            }else{
                setMessage("Error registering user. Please try again.");
            }
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                setMessage(error.response?.data?.detail || "Error registering user. Please try again.");
            } else if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Error registering user. Please try again.");
            }
        } finally{
            setLoading(false);
        }
        }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Register</h1>
                <Input label="Nome" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo:</label>
                    <select value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500">
                        {["admin", "qualidade", "engenharia", "operador", "tecnico_fundicao", "tecnico_usinagem"].map((role) => (
                            <option key={role} value={role}>{role.replace("_", " ")}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>
                        Active:
                        <input
                            type="checkbox"
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            className="ml-2"
                        />
                    </label>
                </div>
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                    {loading ? "Registrando..." : "Registrar"}
                </button>
                {message && (<p className={`mt-4 text-center ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>)}
            </form>
        </div>
    );
}
