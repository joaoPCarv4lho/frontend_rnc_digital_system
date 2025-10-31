import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token && config.headers){
        // set the Authorization header on the existing headers object to keep AxiosHeaders methods
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;