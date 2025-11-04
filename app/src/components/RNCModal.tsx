import { useState, useEffect } from "react";
import api from "../services/api";
import type { RNCModalProps } from "../types/rncModal";
import { useAuth } from "../context/useAuth";
import type { Part } from "../types/part";

export const RNCModal = ({isOpen, onClose, onSubmit}: RNCModalProps) => {
    const {user} = useAuth();
    const [part_code, setPart_code] = useState("");
    const [partData, setPartData] = useState<Part | null>(null);
    const [title, setTitle] = useState("");
    const [observations, setObservations] = useState("");
    const [criticalLevel, setCriticalLevel] = useState("baixo");
    const [condition, setCondition] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // const handleQRCodeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const part_code = event.target.value.trim();
    //     setPartCode(part_code);

    //     // Se o leitor enviar ENTER após ler o QR
    //     if (part_code.length > 0) {
    //         try {
    //             const response = await api.get(`/parts/${part_code}`);
    //             setPartData(response.data);
    //         } catch (error) {
    //             console.error("Erro ao buscar peça:", error);
    //             setPartData(null);
    //         }
    //     }
    // };

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
                return;
            }
            if (!condition) {
                setErrorMsg("Selecione uma condição válida.");
            return;
}
            const payload = {
                part_id: partData.id,
                title,
                observations,
                critical_level: criticalLevel,
                date_of_occurrence: new Date().toISOString(),
                open_by_id: user?.id,
                condition,
            };
            try {
                setLoading(true);
                await api.post("/rnc/create_rnc", payload);
                onSubmit();
                onClose();
                // Limpa o estado
                setTitle("");
                setObservations("");
                setPart_code("");
                setPartData(null);
                setCriticalLevel("baixo");
            } catch (error) {
                console.error("Erro ao criar RNC:", error);
                alert("Erro ao criar RNC. Verifique os dados e tente novamente.");
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
        setCriticalLevel("baixo");
        onClose();
    }

        if(!isOpen) return null;

    return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Criar novo RNC</h2>

        {/* Leitor QR Code
        <label className="block mb-2 text-sm font-medium text-gray-700">
            Leitura do QR Code da peça:
        </label>
        <input
            type="text"
            value={partCode}
            onChange={handleQRCodeInput}
            placeholder="Aproxime o leitor do QR Code..."
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
        /> */}

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

        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

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

        {/* Campo Condição */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
            Condição da Peça:
        </label>
        <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Selecione uma condição</option>
            <option value="em_analise">Em análise</option>
            <option value="aprovado">Aprovado</option>
            <option value="retrabalho">Retrabalho</option>
            <option value="refugo">Refugo</option>
        </select>

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
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
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