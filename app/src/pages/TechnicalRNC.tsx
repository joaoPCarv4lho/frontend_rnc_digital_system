import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, CircleUserRound, ClipboardClock } from "lucide-react";

import { RNCModalTechnical } from "../components/RNCModalTechnical";
import { FadeMessage } from "../components/FadeMessage";
import { RNCSection } from "../components/RNCSection";
import { KpiCard } from "../components/KpiCard";
import { Navbar } from "../components/Navbar";

import { useAuth } from "../context/useAuth";
import api from "../services/api";

import type { RNCListResponse } from "../types/rnc";
import { useRNCWebSocket } from "../hooks/useRNCWebSocket";

const technicalColumns = [
    { key: "num_rnc", label: "N° RNC" },
    { key: "title", label: "Título" },
    { key: "condition", label: "Condição" },
]

export default function TechnicalPage(){
    const {user, isAuthenticated} = useAuth()
    const navigate = useNavigate();

    const [reworkedRncs, setReworkedRncs] = useState<RNCListResponse>({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 1
    });
    const [rncsPending, setRncsPending] = useState<RNCListResponse>({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 1
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(()=> {
        if(!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);

    const fetchRncs = useCallback(async ()=> {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get<RNCListResponse>("/rnc/list/to_be_reworked");
            setRncsPending({
                ...data,
                items: data.items
            });
        } catch (error) {
            console.error("Erro ao buscar RNCs: ", error);
            setError("Erro ao buscar RNCs!")
        }finally{
            setLoading(false);
        }
    }, []);

    const fetchReworked = useCallback(async ()=> {
        setLoading(true);
        setError("");

        try {
            const { data } = await api.get<RNCListResponse>("/rnc/list/rework/user");
            setReworkedRncs({
                ...data,
                items: data.items
            });
        } catch (error) {
            console.error("Erro ao buscar RNCs: ", error);
            setError("Erro ao busar RNCs!")
        }finally{
            setLoading(false);
        }
    }, [])

    useEffect(()=> {
        fetchRncs();
    }, [fetchRncs]);

    useRNCWebSocket({
        onRncCreated: fetchRncs,
        onRncUpdated: fetchReworked,
        onRncClosed: fetchRncs
    })

    if(!isAuthenticated || !user){
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
                <p className="text-gray-500 text-lg">Carregando informações do usuário</p>
            </div>
        )
    }

    const totalReworkeds = reworkedRncs.total;

    return(
        <div className="min-h-screen bg-gray-300">
            <Navbar title="Painel de retrabalho" icon={<CircleUserRound/>}/>

            <div className="container mx-auto px-4 py-8">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">Painel para RNCs retrabalhados</h1>
                    <button onClick={()=> setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
                        Buscar RNC pelo código
                    </button>
                </header>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0}} transition={{ duration: 0.5 }}>
                    <KpiCard title="RNCs pendentes" value={rncsPending.items.length} icon={<ClipboardClock className="text-gray-600 w-6 h-6" />} color="bg-gray-50" />
                    <KpiCard title="RNCs retrabalhados" value={totalReworkeds} icon={<CheckCircle className="text-green-600 w-6 h-6" />} color="bg-green-50" />
                </motion.div>
                
                {/**Mensagem de erro */}
                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-600 p-3 rounded-md mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/**Conteúdo principal */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <FadeMessage key="loading" text="Carregando RNC..." />
                    ) : (
                        <motion.div key="tables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/**Tabela de RNCs retrabalhados pelo usuário */}
                            <RNCSection mode="list" title="RNCs Retrabalhados" rncs={reworkedRncs} situation="retrabalhado" loading={loading} typeColumns={technicalColumns} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/**Modal para buscar RNC pelo código */}
                <RNCModalTechnical isOpen={isModalOpen} onClose={()=> setIsModalOpen(false)} onSubmit={fetchReworked} />
            </div>
        </div>
    )
}