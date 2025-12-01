import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
});

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