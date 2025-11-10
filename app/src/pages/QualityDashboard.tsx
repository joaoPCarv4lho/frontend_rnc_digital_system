import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RNC } from "../types/rnc";
import { RNCTable } from "../components/RNCTable";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import { RNCUpdateModal } from "../components/RNCUpdateModal";

export default function QualityDashboard(){
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [approvedRncs, setApprovedRncs] = useState<RNC[]>([]);
    const [ModalOpen, setModalOpen] = useState(false);
    const [refusedRncs, setRefusedRncs] = useState<RNC[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(()=>{
      if(!isAuthenticated){
        navigate("/login")
        return;
      }
      if (!user) {
        console.log("Usuário ainda não carregado, aguardando...");
        return;
      }
    }, [isAuthenticated, navigate, user]);

    const loadRNCs = async () => {
      try{
        setLoading(true);
        const response = await api.get(`/rnc/list_rncs`);
        const allRncs = response.data;
        
        setApprovedRncs(allRncs.filter((rnc: RNC) => rnc.condition === "aprovado"));
        setRefusedRncs(allRncs.filter((rnc: RNC) => rnc.condition === "refugo"));
        setErrorMsg("");
      }catch(error){
          setErrorMsg("Erro ao buscar RNCs");
          console.error("Erro ao buscar RNCs: ", error);
      }finally{
        setLoading(false);
      }
    };
    
    useEffect(() => {
      loadRNCs();
    }, []);

    if(!isAuthenticated || !user){
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Carregando informações do usuário...</p>
        </div>
      );
    }

    return(
        <div className="min-h-screen bg-gray-100">
            <Navbar title="Dashboard de Qualidade" />
            <div className="max-w-5xl mx-auto mt-8 p-6">
                <div className="flex justify-between items-center mb-4 gap-5">
                  {errorMsg ? (
                    <p className="text-sm text-red-500">{errorMsg}</p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-6 flex-1">
                      <div>
                        <h1 className="text-xl font-semibold">RNCs Aprovadas</h1>
                        {loading ? (
                          <p>Carregando RNCs aprovadas...</p>
                        ) : (
                          <RNCTable rncs={approvedRncs} situation="aprovado" />
                        )}
                      </div>
                      <div>
                        <h1 className="text-xl font-semibold">RNCs Recusadas</h1>
                        {loading ? (
                          <p>Carregando RNCs recusadas...</p>
                        ) : (
                          <RNCTable rncs={refusedRncs} situation="refugado" />
                        )}
                      </div>
                    </div>
                  )}
                    <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Buscar RNC por Código da Peça</button>
                    <RNCUpdateModal isOpen={ModalOpen} onClose={() => setModalOpen(false)} onSubmit={loadRNCs} />
                </div>
            </div>
        </div>
    );

}