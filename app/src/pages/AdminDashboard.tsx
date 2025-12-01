import { useEffect, useState, useCallback } from "react";

import { CheckCircle, ClipboardList, ShieldUser, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { FadeMessage } from "../components/FadeMessage";
import { RNCSection } from "../components/RNCSection";
import { KpiCard } from "../components/KpiCard";
import { Navbar } from "../components/Navbar";

import api from "../services/api";
import type { Statistics } from "../types/rnc";
import { useRNCWebSocket } from "../hooks/useRNCWebSocket";
import { RNCStatisticsCharts } from "../components/RNCStatisticsCharts";


export default function AdminDashboard(){
    const [statistics, setStatistics] = useState<Statistics>({
        total_rncs: 0,
        open_rncs: 0,
        closed_rncs: 0,
        approved_rncs: 0,
        refused_rncs: 0,
        average_resolution_time: 0,
        monthly: [{ month: "", count: 0 }],
        by_status: [{ status: "", total: 0 }],
        by_condition: [{ condition: "", total: 0 }]
    });
    const [approvedRncs, setApprovedRncs] = useState<number>(0);
    const [refusedRncs, setRefusedRncs] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");


    const fetchStatistics = useCallback(async () => {
        setLoading(true);
        setError("");
        try{
            const { data } = await api.get<Statistics>(`/rnc/statistics/`);
            console.log(data)
            setStatistics(data);
            setApprovedRncs(data.approved_rncs ?? 0);
            setRefusedRncs(data.refused_rncs ?? 0);
        }catch(error: any){
            console.error("Erro ao carregar RNCs: ", error)
            setError(error.customMessage);
        }finally{
            setLoading(false);
        }
    }, []);
    
    /**Atualiza lista inicial */
    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    useRNCWebSocket({
        onRncCreated: fetchStatistics,
        onRncUpdated: fetchStatistics,
        onRncClosed: fetchStatistics
    })

    const totalRncs = statistics?.total_rncs;

    return (
        <div className="min-h-screen bg-gray-200">
            <Navbar title="Painel Administrativo" icon={<ShieldUser />} />

            <div className="container mx-auto px-4 py-6"> 
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-200">
                        {/*Botão Limpar Filtros*/}
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            <KpiCard title="RNCs Aprovados" value={approvedRncs} icon={<CheckCircle className="text-green-600 w-6 h-6" />} color="bg-green-50" />
                            <KpiCard title="RNCs Recusados" value={refusedRncs} icon={<XCircle className="text-red-600 w-6 h-6" />} color="bg-red-50" />
                            <KpiCard title="Total de RNCs" value={totalRncs} icon={<ClipboardList className="text-blue-600 w-6 h-6" />} color="bg-blue-50" />
                        </motion.div>
                </div>

                {/** ---------- DASHBOARD DE GRÁficos --------- */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Visão geral em Gráficos</h2>
                    <RNCStatisticsCharts statistics={statistics} />
                </div>

                {/*Tabela de RNCs */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <FadeMessage key="loading" text="Carregando RNCs..." />
                    ): error ? (
                        <FadeMessage key="error" text={error} color="text-red-500" />
                    ): statistics.total_rncs === 0 ? (
                        <FadeMessage key="no-data" text="Nenhum RNC encontrado." />
                    ): (
                        <motion.div key="table" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}>
                            <RNCSection mode="stats" title="Rncs" rncs={statistics} loading={loading}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}