import { useEffect, useState } from "react";
import type { RNC } from "../types/rnc";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

export default function RNCList(){
    const [rncs, setRncs] = useState<RNC[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const {isAuthenticated, logout} = useAuth();

    useEffect(() => {
        async function fetchRncs(){
            try{
                const response = await api.get<RNC[]>("/rnc/list_rncs");
                setRncs(response.data);
            }catch(error){
                console.error("Error fetching RNCs:", error);
                setError("Failed to fetch RNCs. Please try again later.");
            }finally{
                setLoading(false);
            }
        }
        fetchRncs();
    }, [logout]);

    // Helper to safely render an "open_by" value without using `any`
    function renderOpenBy(openBy: unknown): string {
        if (openBy === null || openBy === undefined) return "";
        if (typeof openBy === "string" || typeof openBy === "number" || typeof openBy === "boolean") {
            return String(openBy);
        }
        if (typeof openBy === "object") {
            const obj = openBy as Record<string, unknown>;
            const name = typeof obj.name === "string" ? obj.name : undefined;
            const username = typeof obj.username === "string" ? obj.username : undefined;
            return name ?? username ?? JSON.stringify(openBy);
        }
        return String(openBy);
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    if(loading){
        return <div className="flex flex-col items-center justify-center min-h-screen text-center">Loading...</div>;
    }

    if(error){
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <p className="text-red-500">{error}</p>
                <button onClick={()=> window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Tentar Novamente</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 border">Número do RNC</th>
                        <th className="px-4 py-2 border">Peça associada</th>
                        <th className="px-4 py-2 border">Cliente</th>
                        <th className="px-4 py-2 border">Status</th>
                        <th className="px-4 py-2 border">Condição da Peça</th>
                        <th className="px-4 py-2 border">Observações</th>
                        <th className="px-4 py-2 border">Aberto por:</th>
                        <th className="px-4 py-2 border">Fechado por:</th>
                        <th className="px-4 py-2 border">Data de abertura</th>
                        <th className="px-4 py-2 border">Data de fechamento</th>
                    </tr>
                </thead>
                <tbody>
                    {rncs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">Nenhuma RNC encontrada</td>
                        </tr>
                    ) : (
                        rncs.map((rnc)=>(
                            <tr key={rnc.num_rnc} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{rnc.num_rnc}</td>
                                <td className="px-4 py-2 border">{rnc.part.part_code || "-"}</td>
                                <td className="px-4 py-2 border">{rnc.part.client || "-"}</td>
                                <td className="px-4 py-2 border">{rnc.status}</td>
                                <td className="px-4 py-2 border">{rnc.condition}</td>
                                <td className="px-4 py-2 border">{rnc.observations}</td>
                                <td className="px-4 py-2 border">{renderOpenBy(rnc.open_by)}</td>
                                <td className="px-4 py-2 border">{renderOpenBy(rnc.closed_by)}</td>
                                <td className="px-4 py-2 border">{new Date(rnc.opening_date).toLocaleDateString("pt-BR")}</td>
                                <td className="px-4 py-2 border">{new Date(rnc.closing_date).toLocaleDateString("pt-BR")}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}