import axios from 'axios';
import { mockAdapter } from '../mocks/mockAdapter';

const useMock = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
});

// Modo mock: intercepta as chamadas e devolve dados simulados (sem backend).
// Ative com VITE_USE_MOCK=true no arquivo .env (útil para demos/portfólio).
if (useMock) {
    api.defaults.adapter = mockAdapter;
    console.info("[API] Modo MOCK ativado — usando dados simulados.");
}

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token && config.headers){
        // set the Authorization header on the existing headers object to keep AxiosHeaders methods
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use((response) => response, (error) => {
    const backendMessage = error.response?.data?.error || error.response?.data?.detail || error.response?.data?.message || "Erro desconhecido";
    error.customMessage = backendMessage;

    return Promise.reject(error);
})

export default api;