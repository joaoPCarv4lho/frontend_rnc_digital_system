import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { Navbar } from "../components/Navbar";
import { RNCTable } from "../components/RNCTable";
import type { RNC } from "../types/rnc";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard(){
    const [rncs, setRncs] = useState<RNC[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [conditionFilter, setConditionFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");


    const fetchRncs = useCallback(async () => {
        setLoading(true);
        setError("");
        try{
            const params: Record<string, string> = {};
            if(statusFilter !== "TODOS") params.status = statusFilter.toLowerCase();
            if(conditionFilter !== "TODOS") params.condition = conditionFilter.toLowerCase();
            const response = await api.get<RNC[]>(`/rnc/list_rncs`, { params });
            setRncs(response.data);
        }catch(error){
            console.error("Erro ao carregar RNCs: ", error)
            setError("Erro ao carregar RNCs.");
        }finally{
            setLoading(false);
        }
    }, [statusFilter, conditionFilter]);
    
    useEffect(() => {
        fetchRncs();
    }, [fetchRncs]);

    const handleStatusFilter = (status: string) => {
        setStatusFilter(prev => prev === status ? "TODOS" : status);
    };
    const handleStatusCondition = (condition: string) => {
        setConditionFilter(prev => prev === condition ? "TODOS" : condition);
    };
    const clearFilters = () => {
        setStatusFilter("TODOS");
        setConditionFilter("TODOS");
    };

    function getAvailableConditions(): string[] {
        if (statusFilter === "ABERTO") return ["EM_ANALISE", "RETRABALHO"];
        if (statusFilter === "FECHADO") return ["APROVADO", "REFUGO"];
        return [];
    }

    return (
        <div>
            <Navbar title="Painel Administrativo" />
            <div className="container mx-auto p-4">

            {/*Filtros*/}
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm mb-8 border border-gray-200">
                <div className="flex flex-col gap-6">
                    {/*Filtro de Status*/}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Filtrar por Status:</h2>
                        <div className="flex flex-wrap gap-3 mb-6">
                            {["ABERTO", "FECHADO"].map((status) => (
                                <button 
                                key={status} 
                                onClick={() => handleStatusFilter(status)} 
                                className={`px-4 py-2 rounded-md border ${
                                    statusFilter === status 
                                    ? "bg-blue-600 text-white border-blue-600" 
                                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}>
                                    {status}
                                </button>
                            ))}
                            <button onClick={() => setStatusFilter("TODOS")} className={`px-4 py-2 rounded-md border transition-all duration-150 ${statusFilter === "TODOS" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}>
                                TODOS
                            </button>
                        </div>
                    </div>
                    {/*Mensagem quando nenhum status está selecionado */}
                    {!statusFilter && (
                        <motion.div key="no-status" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                            <p>Selecione um <strong>status</strong> para exibir as condições disponíveis</p>
                        </motion.div>
                    )}
                    {/*Filtro de Condição*/}
                    {statusFilter && statusFilter !== "TODOS" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Filtrar por Condição:</h2>
                        <div className="flex flex-wrap gap-3">
                            {getAvailableConditions().map((cond) => (
                                <button
                                key={cond}
                                onClick={() => handleStatusCondition(cond)}
                                className={`px-4 py-2 rounded-md border ${
                                    conditionFilter === cond
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                            >
                                {cond.replace("_", " ").toUpperCase()}
                            </button>
                            ))}
                            <button onClick={() => setConditionFilter("TODOS")} className={`px-4 py-2 rounded-md border transition-all duration-150 ${conditionFilter === "TODOS" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}>
                                TODOS
                            </button>
                        </div>
                    </div>
                        )}
                    {/*Botão Limpar Filtros*/}
                    <div>
                        <button 
                        onClick={clearFilters} 
                        className="px-4 py-2 rounded-md border bg-gray-200 text-gray-700 hover:bg-gray-300">
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            </div>

            {/*Tabela de RNCs */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.p key="loading" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-gray-500">
                        Carregando RNCs...
                    </motion.p>
                ): error ? (
                    <motion.p key="error" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-red-500">
                        {error}
                    </motion.p>
                ): rncs.length === 0 ? (
                    <motion.p key="no-data" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-gray-500">
                        Nenhuma RNC encontrada.
                    </motion.p>
                ): (
                    <motion.div key="table" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}>
                        <RNCTable rncs={rncs} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
    );
}