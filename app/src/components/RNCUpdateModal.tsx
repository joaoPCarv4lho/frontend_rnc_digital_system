import { useEffect, useState } from "react"
import type { RNC } from "../types/rnc"
import type { RNCUpdateModalProps } from "../types/rncUpdateModal"
import type { Part } from "../types/part";
import api from "../services/api";

export const RNCUpdateModal = ({ isOpen, onClose, onSubmit }: RNCUpdateModalProps) => {
    const [partCode, setPartCode] = useState("");
    const [partData, setPartData] = useState<Part | null>(null);
    const [rncData, setRncData] = useState<RNC | null>(null);
    const [observations, setObservations] = useState("");
    const [critical_level, setCritical_level] = useState("");
    const [condition, setCondition] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if(!partCode.trim()){
            setPartCode("");
            setRncData(null);
            setObservations("");
            setCritical_level("");
            setCondition("");
            setErrorMsg("");
            return;
        }
        const timeout = setTimeout(async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const part_code = partCode.trim();
                const response = await api.get(`/part/code/${part_code}`);
                const data = response.data;
                setPartData(data);
            } catch (error) {
                console.error("Erro ao buscar peça: ", error);
                setErrorMsg("Peça não encontrada");
            } finally {
                setLoading(false);
            }
        }, 800)
        return () => clearTimeout(timeout);
    }, [partCode]);

    const handleFetchRNC = async () => {
        if(!partData){
            setErrorMsg("Nenhuma peça selecionada!");
            return;
        }

        try {
            const response = await api.get(`/rnc/partCode/${partCode}`);
            const data = response.data;
            console.log("RNC encontrada: ", data);
            setRncData(data);
            setObservations(data.observations || "");
            setCritical_level(data.critical_level || "");
            setCondition(data.condition || "");
        } catch (error) {
            console.error("Erro ao buscar RNC: ", error);
            setErrorMsg("RNC não encontrado para esse código de peça");
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateRNC = async () => {
        if(!rncData) return;
        try {
            setLoading(true);
            await api.patch(`/rnc/update_rnc/${rncData.num_rnc}`, {
                observations,
                critical_level: critical_level,
                condition
            });
            onSubmit();
            onClose();
            setPartCode("");
            setRncData(null);
            setObservations("");
            setCritical_level("");
            setCondition("");
            setErrorMsg("");
            alert("RNC atualizada com sucesso!");
            handleClose();
        } catch (error) {
            console.error("Erro ao atualizar RNC: ", error);
            alert("Erro ao atualizar RNC");
        }
    };

    const handleClose = () => {
        setPartCode("");
        setRncData(null);
        setObservations("");
        setCritical_level("");
        setCondition("");
        setErrorMsg("");
        onClose();
    };

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-lg font-bold mb-4">Buscar RNC por código da peça</h2>
                {rncData ? (
                    <button onClick={() => {setRncData(null); setErrorMsg("");}} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">&times;</button>
                ) : null}
                { !rncData ? (
                    <div className="flex gap-2 mb-4">
                        <input type="text" value={partCode} onChange={(e) => setPartCode(e.target.value)} placeholder="Insira o código da peça..." className="w-full border rounded p-2" />
                        <button onClick={handleFetchRNC} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Buscar RNC</button>
                    </div>
                ) : (
                    <>
                        <input type="text" value={partCode} onChange={(e) => setPartCode(e.target.value)} placeholder="Insira o código da peça..." className="w-full border rounded p-2 mb-3" />
                        {loading && <p className="text-sm text-gray-500">Buscando RNC...</p>}
                        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                        <div className="space-y-4">
                            <div className="border rounded p-3 bg-gray-50">
                                <h3 className="font-semibold mb-2">Informações da Peça</h3>
                                <p><strong>Titulo do RNC:</strong> {rncData.title}</p>
                                <p><strong>Número do RNC:</strong> {rncData.num_rnc}</p>
                                <p><strong>Código da Peça:</strong> {rncData.part?.part_code}</p>
                                <p><strong>Descrição:</strong> {rncData.part?.description}</p>
                                <p><strong>Status:</strong> {rncData.status}</p>
                                <p><strong>Condição:</strong> {rncData.condition}</p>
                                <p><strong>Nível crítico:</strong> {rncData.critical_level}</p>
                                <p><strong>Data de Ocorrência:</strong> {new Date(rncData.opening_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <textarea placeholder="Observações..." value={observations} onChange={(e) => setObservations(e.target.value)} className="w-full border rounded p-2" rows={4}/>
                                <label className="text-sm font-semibold mt-2">Nível Crítico</label>
                                <select value={critical_level} onChange={(e) => setCritical_level(e.target.value)} className="w-full border rounded p-2">
                                    <option value="">Selecione</option>
                                    <option value="baixo">Baixo</option>
                                    <option value="medio">Médio</option>
                                    <option value="alto">Alto</option>
                                </select>
                                <label className="text-sm font-semibold mt-2">Condição:</label>
                                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border rounded p-2">
                                    <option value="">Selecione</option>
                                    <option value="em_analise">Em análise</option>
                                    <option value="aprovado">Aprovado</option>
                                    <option value="retrabalho">Retrabalho</option>
                                    <option value="refugo">Refugo</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={handleClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                    {rncData && (
                        <button onClick={handleUpdateRNC} className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white">Realizar apontamento</button>
                    )}
                </div>
            </div>
        </div>
    );
}