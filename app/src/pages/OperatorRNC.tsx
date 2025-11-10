import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import { RNCTable } from "../components/RNCTable";
import { RNCModal } from "../components/RNCModal";
import { Navbar } from "../components/Navbar";
import type { RNC } from "../types/rnc";

export default function OperatorRNCPage(){
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [rncs, setRncs] = useState<RNC[]>([]);
    const [ModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    console.log("OperatorRNCPage render:", { user, isAuthenticated, rncs });

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

    const loadRNCs = async () =>{
        try{
            console.log("Carregando RNCs do usuário...");
            setLoading(true);
            const response = await api.get("/rnc/list_user_rncs");
            console.log("RNCs recebidas:", response.data);
            setRncs(Array.isArray(response.data) ? response.data : []);
        }catch(error){
            console.error("Error loading RNCs:", error);
            setRncs([]);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() =>{
        loadRNCs();
    }, []);

      // Fallback para página em branco
    if (!isAuthenticated || !user) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Carregando informações do usuário...</p>
        </div>
        );
    }

    return(
        <div className="min-h-screen bg-gray-100">
            <Navbar title="Operador RNC"/>
            <div className="max-w-5xl mx-auto mt-8 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">RNCs Criados</h1>
                    <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Criar novo RNC</button>
                </div>
                {/* Loader */}
                {loading ? (
                    <p>Carregando RNCs...</p>
                ) : rncs.length === 0 ? (
                    <p>Nenhum RNC encontrado.</p>
                ) : (
                    <RNCTable rncs={rncs} />
                )}
                <RNCModal isOpen={ModalOpen} onClose={() => setModalOpen(false)} onSubmit={loadRNCs} />
            </div>
        </div>
    );
}
