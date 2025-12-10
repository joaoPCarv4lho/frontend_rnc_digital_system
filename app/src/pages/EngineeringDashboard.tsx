import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CheckCircle, CircleUserRound, ClipboardList, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { RNCUpdateModal } from "../components/RNCUpdateModal";
import { FadeMessage } from "../components/FadeMessage";
import { RNCSection } from "../components/RNCSection";
import { KpiCard } from "../components/KpiCard";
import { Navbar } from "../components/Navbar";

import { useRNCWebSocket } from "../hooks/useRNCWebSocket";
import type { RNCListResponse } from "../types/rnc";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const qualityColumns = [
    { key: "num_rnc", label: "N° RNC" },
    { key: "title", label: "Título" },
    { key: "status", label: "Status" },
    { key: "condition", label: "Condição" },
    { key: "closing_date", label: "Data de Fechamento" }
];


export default function EngineeringDashboard(){
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const [approvedRncs, setApprovedRncs] = useState<RNCListResponse>({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 1
    });
    const [refusedRncs, setRefusedRncs] = useState<RNCListResponse>({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 1
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(()=>{
      if(!isAuthenticated) navigate("/login");
    }, [isAuthenticated, navigate]);

    {/**Carrega todos os RNCs e separa por condição */}
    const fetchRncs = useCallback(async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const { data } = await api.get<RNCListResponse>("/rnc/list/analysis/user");
        setApprovedRncs({
          ...data,
          items: data.items.filter((rnc)=> rnc.condition === "aprovado")
        });
        setRefusedRncs({
          ...data,
          items: data.items.filter((rnc)=> rnc.condition === "refugo")
        });
      } catch (error: any) {
        console.error("Erro ao buscar RNCs: ", error);
        setErrorMsg(error.customMessage);
      }finally{
        setLoading(false);
      }
    }, []);
    
    {/**Função para recarregar RNCs ao submeter o modal */}
    useEffect(() => {
      fetchRncs();
    }, [fetchRncs]);

    {/**WebSocket listener */}
    useRNCWebSocket({
      onRncCreated: fetchRncs,
      onRncUpdated: fetchRncs,
      onRncClosed: fetchRncs
    })

    {/**Fallback de carregamento inicial */}
    if(!isAuthenticated || !user){
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
          <p className="text-gray-500 text-lg">Carregando informações do usuário...</p>
        </div>
      );
    }

    const totalRncs = approvedRncs.total + refusedRncs.total;

    return(
      <div className="min-h-screen bg-gray-300">
        <Navbar title="Painel de Engenharia" icon={<CircleUserRound />}/>

        <div className="container mx-auto px-4 py-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard de Qualidade</h1>
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition">
              Buscar RNC pelo código
            </button>
          </header>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <KpiCard title="RNCs Aprovados" value={approvedRncs.total} icon={<CheckCircle className="text-green-600 w-6 h-6" />} color="bg-green-50" />
            <KpiCard title="RNCs Recusados" value={refusedRncs.total} icon={<XCircle className="text-red-600 w-6 h-6" />} color="bg-red-50" />
            <KpiCard title="Total de RNCs" value={totalRncs} icon={<ClipboardList className="text-blue-600 w-6 h-6" />} color="bg-blue-50" />
          </motion.div>

          {/**Mensagem de erro */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-600 p-3 rounded-md mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          {/**Conteúdo principal */}
          <AnimatePresence mode="wait">
            {loading ? (
              <FadeMessage key="loading" text="Carregando RNC..." />
            ) : (
              <motion.div key="tables" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/**Tabela de RNCs Aprovados */}
                <RNCSection mode="list" title="RNCs Aprovados" rncs={approvedRncs} situation="aprovado" loading={loading} typeColumns={qualityColumns} />

                {/**Tabela de RNCs Recusados */}
                <RNCSection mode="list" title="RNCs Recusados" rncs={refusedRncs} situation="refugo" loading={loading} typeColumns={qualityColumns}/>
              </motion.div>
            )}
          </AnimatePresence>

          {/**Modal para buscar RNC pelo código */}
          <RNCUpdateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={fetchRncs} />
        </div>
      </div>
    );

}