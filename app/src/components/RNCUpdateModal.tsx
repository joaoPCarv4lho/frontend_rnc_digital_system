import { useEffect, useState } from "react"
import { toast } from "react-hot-toast";
import type { RNCReadWithPart } from "../types/rnc"
import type { RNCUpdateModalProps } from "../types/rncUpdateModal"
import api from "../services/api";

export const RNCUpdateModal = ({ isOpen, onClose, onSubmit }: RNCUpdateModalProps) => {
    const [part_code, setPart_code] = useState("");
    const [rncData, setRncData] = useState<RNCReadWithPart | null>(null);
    const [analysisObservations, setAnalysisObservations] = useState("");
    const [rootCause, setRootCause] = useState("");
    const [correctiveAction, setCorrectiveAction] = useState("");
    const [preventiveAction, setPreventiveAction] = useState("");
    const [estimatedReworkTime, setEstimatedReworkTime] = useState(0);
    const [requiresExternalSupport, setRequiresExternalSupport] = useState(false);
    const [requireRework, setRequireRework] = useState(false);
    const [qualityVerified, setQualityVerified] = useState(false);
    const [closeRnc, setCloseRnc] = useState(false);
    const [critical_level, setCritical_level] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [refused, setRefused] = useState(false);

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
        if(!rncData) return;
        const payload = {
            analysis_observations: analysisObservations,
            critical_level,
            root_cause: rootCause,
            corrective_action: correctiveAction,
            preventive_action: preventiveAction,
            estimated_rework_time: estimatedReworkTime,
            requires_external_support: requiresExternalSupport,
            quality_verified: qualityVerified,
            close_rnc: closeRnc,
            refused: refused
        }
        try {
            setLoading(true);
            await api.patch(`/rnc/analysis/${rncData.num_rnc}`, payload);
            toast.success("RNC atualizado com sucesso!");
            onSubmit();
            onClose();
            clear()
            handleClose();
        } catch (error: any) {
            console.error("Erro ao atualizar RNC: ", error);
            toast.error(error.customMessage || "Erro ao atualizar RNC");
            setErrorMsg(error.customMessage)
        } finally {
            setLoading(false);
        }
    };

    const clear = () => {
        setPart_code("")
        setRncData(null)
        setAnalysisObservations("")
        setCritical_level("")
        setRootCause("")
        setCorrectiveAction("")
        setPreventiveAction("")
        setEstimatedReworkTime(0)
        setRequiresExternalSupport(false)
        setQualityVerified(false)
        setRefused(false)
        setErrorMsg("")
        setLoading(false)
    }

    const handleClose = () => {
        setPart_code("");
        setRncData(null);
        setAnalysisObservations("");
        setCritical_level("");
        setRootCause("")
        setCorrectiveAction("")
        setPreventiveAction("")
        setEstimatedReworkTime(0)
        setRequiresExternalSupport(false)
        setQualityVerified(false)
        setRefused(false)
        setErrorMsg("")
        setLoading(false)
        onClose();
    };

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 overflow-y-auto flex items-start justify-center bg-black/40 bg-opacity-40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">Analisar RNC</h2>
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
                        {rncData.condition === "em_analise" ? (
                            <p><strong>Observações do Operador: </strong>{rncData?.observations}</p>
                            ) : rncData.condition === "aguardando_verificacao" && (
                                <p><strong>Observações do Tecnico: </strong>{rncData?.rework_description}</p>
                            )}
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
                    </div>
                )}

                {/**Campos do RNC */}
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Observações
                    <textarea
                        value={analysisObservations}
                        onChange={(e)=> setAnalysisObservations(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Causa raíz indentificada
                    <input
                        type="text"
                        value={rootCause}
                        onChange={(e)=> setRootCause(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Ação corretiva proposta:
                    <input 
                        type="text" 
                        value={correctiveAction} 
                        onChange={(e)=> setCorrectiveAction(e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Ação preventiva proposta: 
                    <input 
                        type="text" 
                        value={preventiveAction} 
                        onChange={(e)=> setPreventiveAction(e.target.value)} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tempo de retrabalho estimado (em minutos):  
                    <input 
                        type="number"
                        value={estimatedReworkTime} 
                        onChange={(e)=> {
                            const v = e.target.value;
                            setEstimatedReworkTime(v === "" ? 0 : Number(v));
                        }} 
                        className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </label>

                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="requireExternalSupport" className="text-sm font-medium text-gray-700 cursor-pointer">
                        <span>Requer suporte externo?</span>
                    </label>
                    <input 
                        type="checkbox" 
                        checked={requiresExternalSupport}
                        onChange={(e)=> setRequiresExternalSupport(e.target.checked)} 
                        className="h-4 w-4 cursor-pointer" 
                    />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="requireExternalSupport" className="text-sm font-medium text-gray-700 cursor-pointer">
                        <span>Não requer Retrabalho</span>
                    </label>
                    <input 
                        type="checkbox" 
                        checked={requireRework}
                        onChange={(e)=> setRequireRework(e.target.checked)} 
                        className="h-4 w-4 cursor-pointer" 
                    />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="refused" className="text-sm font-medium text-gray-700 cursor-pointer">
                        <span>Refugo?</span>
                    </label>
                    <input 
                        type="checkbox"
                        checked={refused}
                        onChange={(e)=> setRefused(e.target.checked)}
                        className="h-4 w-4 cursor-pointer"
                        />
                </div>
                {rncData?.condition === "aguardando_verificacao" && (
                    <div className="flex items-center gap-2 mb-4">
                        <label htmlFor="qualityVerified" className="text-sm font-medium text-gray-700 cursor-pointer">
                            <span>Qualidade verificada após retrabalho</span>
                        </label>
                        <input 
                            type="checkbox"
                            checked={qualityVerified}
                            onChange={(e)=>setQualityVerified(e.target.checked)}
                            className="h-4 w-4 cursor-pointer"
                        />
                    </div>
                )}
                {qualityVerified || requireRework ? (
                    <div className="flex items-center gap-2 mb-4">
                        <label htmlFor="closeRnc" className="text-sm font-medium text-gray-700 cursor-pointer">
                            <span>Fechar RNC</span>
                        </label>
                        <input 
                            type="checkbox"
                            checked={closeRnc}
                            onChange={(e)=> setCloseRnc(e.target.checked)}
                            className="h-4 w-4 cursor-pointer"
                            />
                    </div>
                ): (
                    <></>
                )}

                <div className="flex justify-end mt-6 space-x-3">
                    { errorMsg && <p className="text-sm text-center text-red-500">{errorMsg}</p>}
                    <button onClick={handleClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                    {rncData && (
                        <button onClick={handleUpdateRNC} className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                            {loading ? "Atualizando..." : "Realizar apontamento"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}