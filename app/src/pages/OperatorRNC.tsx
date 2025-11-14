import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import { RNCModal } from "../components/RNCModal";
import { Navbar } from "../components/Navbar";
import { FadeMessage } from "../components/FadeMessage";

import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { connectToSocket } from "../services/socket";
import { adaptWebSocketDataToRNC } from "../utils/convertRNC";

import type { RNC } from "../types/rnc";
import type { RNCEvent } from "../types/rncEvents";
import { RNCSection } from "../components/RNCSection";

const operatorColumns = [
    { key: "num_rnc", label: "N° RNC" },
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "condition", label: "Condição" },
    { key: "closing_date", label: "Data de Fechamento" }
];

export default function OperatorRNCPage(){
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const [rncs, setRncs] = useState<RNC[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");


    useEffect(()=>{
        if(!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate, user]);

    const fetchUserRncs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get<RNC[]>("/rnc/list_user_rncs");
            setRncs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar RNCs: ", error);
            setError("Erro ao seus carregar RNCs")
            setRncs([]);
        }finally{
            setLoading(false);
        }
    }, []);

    useEffect(() =>{
        if(user) fetchUserRncs();
    }, [user, fetchUserRncs]);

    useEffect(() => {
        const socket = connectToSocket((data: RNCEvent) => {
            switch (data.event){
                case "rnc_created":
                    toast.success("Novo RNC Criado!!");
                    setRncs((prev) => [...prev, adaptWebSocketDataToRNC(data.payload)]);
                    break;
                case "rnc_updated":
                    toast(`RNC atualizada: ${data.payload.title}`);
                    setRncs((prev) => prev.map((rnc) => rnc.id === data.payload.id ? adaptWebSocketDataToRNC(data.payload) : rnc));
                    break;
                default:
                    console.log("Evento de socket desconhecido: ", data);
            }
        });
        return () => {
            if(socket && socket.readyState === WebSocket.OPEN){
                socket.close();
            }
        };
    }, []);

      // Fallback para página em branco
    if (!isAuthenticated || !user) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p>Carregando informações do usuário...</p>
        </div>
        );
    }

    return(
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Painel do Operador"/>

            <div className="container mx-auto px-4 py-8">
                {/**Cabeçalho */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">RNCs abertos por mim</h1>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                        Abrir Novo RNC
                    </button>
                </div>

                {/**Conteúdo principal */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <FadeMessage key="loading" text="Carregando RNCs..." />
                    ) : error ?(
                        <FadeMessage key="error" text={error} color="text-red-500" />
                    ) : rncs.length === 0 ?(
                        <FadeMessage key="empty" text="Nenhum RNC encontrado" />
                    ) : (
                        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                            <RNCSection title="Meus RNCs" rncs={rncs} situation="" loading={loading} typeColumns={operatorColumns} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/**Modal para criação de novo RNC */}
                <RNCModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={fetchUserRncs} />
            </div>
        </div>
    );
} 
