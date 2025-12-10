import { useEffect, useState } from "react"
import { toast } from "react-hot-toast";
import type { RNCReadWithPart } from "../types/rnc"
import type { RNCUpdateModalProps } from "../types/rncUpdateModal"
import api from "../services/api";

export const RNCModalTechnical = ({ isOpen, onClose, onSubmit }: RNCUpdateModalProps) => {
    const [part_code, setPart_code] = useState("");
    const [rncData, setRncData] = useState<RNCReadWithPart | null>(null);
    const [reworkObservations, setReworkObservations] = useState("");
    const [actionsTaken, setActionsTaken] = useState("");
    const [materialsUsed, setMaterialsUsed] = useState("");
    const [timeSpent, setTimeSpent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if(!part_code.trim()){
            setRncData(null);
            setErrorMsg("");
            return;
        }
        const timeout = setTimeout(async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const response = await api.get<RNCReadWithPart>(`/rnc/partCode/${part_code}`);
                setRncData(response.data)
                console.log(response.data)
            } catch (error) {
                console.error("Erro ao buscar peça: ", error);
                setRncData(null)
                setErrorMsg("Peça não encontrada");
            } finally {
                setLoading(false);
            }
        }, 900)
        return () => clearTimeout(timeout);
    }, [part_code]);

    const handleUpdateRNC = async () => {
        if(!rncData) {
            toast.error("Nenhum RNC selecionado");
            return;
        }
        const payload = {
            rework_description: reworkObservations,
            actions_taken: actionsTaken,
            materials_used: materialsUsed,
            time_spent: timeSpent
        }
        try {
            setLoading(true);
            await api.patch(`/rnc/rework/${rncData.num_rnc}`, payload);
            toast.success("Retrabalho registrado com sucesso!");
            onSubmit();
            onClose();
            clear()
            handleClose();
        } catch (error: any) {
            console.error("Erro ao atualizar RNC: ", error);
            toast.error(error.customMessage || "Erro ao registrar retrabalho");
            setErrorMsg(error.customMessage)
        } finally {
            setLoading(false);
        }
    };

    const clear = () => {
        setPart_code("")
        setRncData(null)
        setReworkObservations("")
        setActionsTaken("")
        setMaterialsUsed("")
        setTimeSpent(0);
        setErrorMsg("")
        setLoading(false)
    }

    const handleClose = () => {
        setPart_code("");
        setRncData(null);
        setReworkObservations("")
        setActionsTaken("")
        setMaterialsUsed("")
        setTimeSpent(0);
        setErrorMsg("")
        setLoading(false)
        onClose();
    };

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 overflow-y-auto flex items-start justify-center bg-black/40 bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Registrar Retrabalho</h2>
                <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Código da peça:
                    </label>
                    <input 
                        type="text" 
                        value={part_code} 
                        onChange={(e)=> setPart_code(e.target.value)} 
                        placeholder="Inform o código da peça..." 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    {loading && (
                        <p className="absolute top-10 right-3 text-black-500 text-sm">Carregando...</p>
                    )}
                </div>

                {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

                {rncData && (
                    <div className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-700 mb-2">Informações do RNC atrelado a peça</h3>
                        <p><strong>Título do RNC - </strong>{rncData?.title}</p>
                        <p><strong>N° RNC : </strong>{rncData?.num_rnc}</p>
                        <p><strong>Observações do Operador: </strong>{rncData?.observations}</p>
                        <p><strong>Observações da Qualidade: </strong>{rncData?.analysis_observations}</p>
                        <p><strong>Descrição da Peça: </strong>{rncData?.part.description}</p>
                        <p><strong>Cliente: </strong>{rncData?.part.client}</p>
                        <p><strong>Condição da Peça: </strong>{rncData?.condition}</p>
                        <p><strong>Peça ativa? </strong>{rncData?.part.active ? "Sim" : "Peça descontinuada"}</p>
                        <p><strong>Nível Crítico - </strong>{rncData?.critical_level}</p>
                        <p><strong>Data/hora de ocorrência - </strong>{rncData?.date_of_occurrence ? new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        }).format(new Date(rncData.date_of_occurrence)) : "-"}</p>
                        <p><strong>Data/hora de apontamento - </strong>{rncData?.analysis_date ? new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        }).format(new Date(rncData.analysis_date)) : "-"}</p>
                    </div>
                )}

                {/**Campos do RNC */}
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Observações do Retrabalho
                    <textarea 
                        value={reworkObservations} 
                        onChange={(e)=> setReworkObservations(e.target.value)}
                        rows={4} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>
                
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Ações tomadas durante retrabalho
                    <input 
                        type="text" 
                        value={actionsTaken} 
                        onChange={(e)=> setActionsTaken(e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Materiais usados no retrabalho
                    <input 
                        type="text" 
                        value={materialsUsed} 
                        onChange={(e)=> setMaterialsUsed(e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tempo de retrabalho utilizado (em minutos):  
                    <input 
                        type="number"
                        value={timeSpent} 
                        onChange={(e)=> {
                            const v = e.target.value;
                            setTimeSpent(v === "" ? 0 : Number(v));
                        }} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <div className="flex justify-end mt-6 space-x-3">
                    { errorMsg && <p className="text-sm text-center text-red-500">{errorMsg}</p>}
                    <button onClick={handleClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                    {rncData && (
                        <button onClick={handleUpdateRNC} className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                            {loading ? "Registrando..." : "Realizar apontamento"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}