import { CheckCircle, ClipboardList, XCircle } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { Navbar } from "../components/Navbar";
import { RNCSection } from "../components/RNCSection";
import { FadeMessage } from "../components/FadeMessage";
import { KpiCard } from "../components/KpiCard";


import api from "../services/api";
import { connectToSocket } from "../services/socket";
import { adaptWebSocketDataToRNC } from "../utils/convertRNC";

import type { RNC } from "../types/rnc";
import type { RNCEvent } from "../types/rncEvents";

const STATUS_OPTIONS = ["TODOS", "ABERTO", "FECHADO"];
const CONDITION_OPTIONS: Record<string, string[]> = {
    ABERTO: ["EM_ANALISE", "RETRABALHO"],
    FECHADO: ["APROVADO", "REFUGO"]
};

const adminColumns = [
    { key: "num_rnc", label: "N° RNC" },
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "open_by", label: "Aberto por" },
    { key: "role", label: "Cargo/Setor" },
    { key: "condition", label: "Condição" },
    { key: "closing_date", label: "Data de Fechamento" }
];

export default function AdminDashboard(){
    const [rncs, setRncs] = useState<RNC[]>([]);
    const [approvedRncs, setApprovedRncs] = useState<RNC[]>([]);
    const [refusedRncs, setRefusedRncs] = useState<RNC[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [conditionFilter, setConditionFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const filteredConditions = useMemo(() => CONDITION_OPTIONS[statusFilter] || [], [statusFilter]);

    const fetchRncs = useCallback(async () => {
        setLoading(true);
        setError("");
        try{
            const params: Record<string, string> = {};
            if(statusFilter !== "TODOS") params.status = statusFilter.toLowerCase();
            if(conditionFilter !== "TODOS") params.condition = conditionFilter.toLowerCase();
            const { data } = await api.get<RNC[]>(`/rnc/list_rncs`, { params });
            setRncs(data);
            setApprovedRncs(data.filter((rnc) => rnc.condition === "aprovado"));
            setRefusedRncs(data.filter((rnc) => rnc.condition === "refugo"));
        }catch(error){
            console.error("Erro ao carregar RNCs: ", error)
            setError("Erro ao carregar RNCs.");
        }finally{
            setLoading(false);
        }
    }, [statusFilter, conditionFilter]);
    
    /**Atualiza lista inicial */
    useEffect(() => {
        fetchRncs();
    }, [fetchRncs]);

    /**WebSocket listener */
    useEffect(() => {
        const socket = connectToSocket((data: RNCEvent) => {
            switch (data.event){
                case "rnc_created":
                    toast.success("Novo RNC Criado!");
                    setRncs((prev) => [...prev, adaptWebSocketDataToRNC(data.payload)]);
                    break;
                case "rnc_updated":
                    toast(`RNC atualizada: ${data.payload.title}`);
                    setRncs((prev) => prev.map((rnc) => rnc.id === data.payload.id ? adaptWebSocketDataToRNC(data.payload) : rnc));
                    break;
                default:
                    console.warn("Evento de socket desconhecido: ", data);
            }
        });
        return () => {
            if(socket && socket.readyState === WebSocket.OPEN){
                socket.close();
            }
        };
    }, []);

    /**Handlers de filtro */
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

    const totalRncs = approvedRncs.length + refusedRncs.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="Painel Administrativo" />

            <div className="container mx-auto px-4 py-6"> 
            {/*Filtros*/}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-200">
                    <div className="flex flex-col gap-6">
                        {/*Filtro de Status*/}
                        <FilterSection 
                            title="Filtrar por Status" 
                            options={STATUS_OPTIONS} 
                            active={statusFilter} 
                            onSelect={handleStatusFilter} 
                            color="blue" 
                        />
                        {/* Mensagem quando nenhum status está selecionado
                        {!statusFilter && (
                            <motion.div key="no-status" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                <p>Selecione um <strong>status</strong> para exibir as condições disponíveis</p>
                            </motion.div>
                        )} */}
                        {/*Filtro de Condição*/}
                        {statusFilter !== "TODOS" && (
                            <FilterSection 
                                title="Filtrar por Condição" 
                                options={filteredConditions} 
                                active={conditionFilter} 
                                onSelect={handleStatusCondition} 
                                color="green" 
                            />
                        )}
                        {/*Botão Limpar Filtros*/}
                        <div>
                            <button 
                            onClick={clearFilters} 
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition">
                                Limpar Filtros
                            </button>
                        </div>
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <KpiCard title="RNCs Aprovados" value={approvedRncs.length} icon={<CheckCircle className="text-green-600 w-6 h-6" />} color="bg-green-50" />
                            <KpiCard title="RNCs Recusados" value={refusedRncs.length} icon={<XCircle className="text-red-600 w-6 h-6" />} color="bg-red-50" />
                            <KpiCard title="Total de RNCs" value={totalRncs} icon={<ClipboardList className="text-blue-600 w-6 h-6" />} color="bg-blue-50" />
                        </motion.div>
                    </div>
                </div>

                {/*Tabela de RNCs */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <FadeMessage key="loading" text="Carregando RNCs..." />
                    ): error ? (
                        <FadeMessage key="error" text={error} color="text-red-500" />
                    ): rncs.length === 0 ? (
                        <FadeMessage key="no-data" text="Nenhum RNC encontrado." />
                    ): (
                        <motion.div key="table" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}>
                            <RNCSection title="RNCs" rncs={rncs} loading={loading} typeColumns={adminColumns} situation="" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function FilterSection({
    title,
    options,
    active,
    onSelect,
    color,
}: {
    title: string;
    options: string[];
    active: string;
    onSelect: (val: string) => void;
    color: "blue" | "green";
}) {
    const colorClasses = color == "blue" ? {
        active: "bg-blue-600 text-white border-blue-600",
        inactive: "bg-white text-gray-700 hover:bg-gray-100 border-gray-300",
    } : {
        active: "bg-green-600 text-white border-green-600",
        inactive: "bg-white text-gray-700 hover:bg-gray-100 border-gray-300",
    };

    return(
        <div>
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <div className="flex flex-wrap gap-3">
                {options.map((opt) => (
                    <button 
                    key={opt} 
                    onClick={() => onSelect(opt)} 
                    className={`px-4 py-2 rounded-md border transition-all duration-150 ${
                        active === opt ? colorClasses.active : colorClasses.inactive
                    }`}>{opt.replace("_", " ")}</button>
                ))}
                {/* <button onClick={() => onSelect("TODOS")} className={`px-4 py-2 rounded-md border transition-all duration-150 ${
                    active === "TODOS" ? colorClasses.active : colorClasses.inactive
                }`}>TODOS</button> */}
            </div>
        </div>
    )
}