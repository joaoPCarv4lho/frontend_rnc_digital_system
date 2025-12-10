import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";
import type { RNCModalProps } from "../types/rncModal";
import type { Part } from "../types/part";

export const RNCModal = ({isOpen, onClose, onSubmit}: RNCModalProps) => {
    const [partData, setPartData] = useState<Part | null>(null);
    const [part_code, setPart_code] = useState("");
    const [title, setTitle] = useState("");
    const [observations, setObservations] = useState("");
    const [criticalLevel, setCriticalLevel] = useState("baixa");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");;
    useEffect(() =>{
        if(!part_code.trim()){
            setPartData(null);
            setErrorMsg("");
            return;
        }
        const timeout = setTimeout(async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const response = await api.get(`/part/code/${part_code}`);
                setPartData(response.data);
                console.log(response)
                
            } catch (error) {
                console.error("Erro ao buscar peça:", error);
                setPartData(null);
            }finally{
                setLoading(false);
            }
        }, 900);

        return () => clearTimeout(timeout);
    }, [part_code]);

    const handleSubmit = async () => {
            if (!partData) {
                setErrorMsg("Nenhuma peça selecionada!");
                toast.error("Nenhuma peça selecionada!");
                return;
            }
            const payload = {
                part_id: partData.id,
                part_code: part_code,
                title,
                critical_level: criticalLevel,
                observations,
            };
            try {
                setLoading(true);
                await api.post("/rnc/create_rnc", payload);
                toast.success("RNC criado com sucesso!");
                onSubmit();
                onClose();
                // Limpa o estado
                setTitle("");
                setObservations("");
                setPart_code("");
                setPartData(null);
                setCriticalLevel("baixa");
            } catch (error: any) {
                console.error("Erro ao criar RNC:", error);
                toast.error(error.customMessage || "Erro ao criar RNC");
            } finally {
                setLoading(false);
        }
    };

    const handleCancel = () => {
        // Limpa o estado ao cancelar
        setTitle("");
        setObservations("");
        setPart_code("");
        setPartData(null);
        setCriticalLevel("baixa");
        setErrorMsg("");
        onClose();
    }

        if(!isOpen) return null;

    return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Criar novo RNC</h2>
            <div className="relative">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Código da Peça:
                </label>
                <input
                    type="text"
                    value={part_code}
                    onChange={(e) => setPart_code(e.target.value)}
                    placeholder="Digite o código da peça..."
                    className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {loading && (
                    <p className="absolute top-10 right-3 text-black-500 text-sm">Carregando...</p>
                )}
            </div>

            {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

            {/* Mini ficha da peça */}
            {partData && (
                <div className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-2">Ficha da Peça</h3>
                    <p><strong>Código:</strong> {partData.part_code}</p>
                    <p><strong>Descrição:</strong> {partData.description}</p>
                    <p><strong>Cliente:</strong> {partData.client}</p>
                    <p><strong>Ativo:</strong> {partData.active ? "Sim" : "Não"}</p>
                </div>
            )}

        {/* Campos do RNC */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
            Título do RNC:
        </label>
        <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Campo Observações */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
            Observações:
        </label>
        <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Select de Nível Crítico */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
            Nível Crítico:
        </label>
        <select
            value={criticalLevel}
            onChange={(e) => setCriticalLevel(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Selecione o nível de criticidade</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Critica</option>
        </select>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? "Enviando..." : "Criar RNC"}
                </button>
            </div>
        </div>
    </div>
    );
}