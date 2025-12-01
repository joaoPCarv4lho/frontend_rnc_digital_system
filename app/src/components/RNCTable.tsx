import type { RNCTableProps } from "../types/rncTable";
import { motion } from "framer-motion";


export const RNCTable = ({rncs, situation, columns}: RNCTableProps) => {
    if (!rncs || rncs.length === 0){
        return <p className="text-center text-gray-500 mt-6">Nenhum RNC {situation ? situation : ""} encontrado.</p>
    }

    return(
        <div className="overflow-x-auto mt-4 rounded-xl border border-gray-200 shadow-sm bg-white">
            <motion.table className="min-w-full divide-y divide-gray-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <thead className="bg-gray-100 text-left text-gray-700 text-sm font-medium">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="p-2 border-b font-medium text-left">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                    {rncs.map((rnc) => (
                        <motion.tr className="hover:bg-gray-50 transition-colors" key={rnc.id}>
                            {columns.map((col) => {
                                const value = (rnc as unknown as Record<string, unknown>)[col.key]

                                switch(col.key){
                                    case "status":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                <StatusBadge status={rnc.status} />
                                            </td>
                                        );
                                    case "condition":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                <ConditionBadge condition={rnc.condition} />
                                            </td>
                                        );
                                    case "date_of_occurrence":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                {rnc?.date_of_occurrence ? new Intl.DateTimeFormat("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: false
                                                }).format(new Date(rnc?.date_of_occurrence)) : "-" }
                                            </td>
                                        );
                                    case "closing_date":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                {rnc?.closing_date ? new Intl.DateTimeFormat("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: false
                                                }).format(new Date(rnc?.closing_date)) : "-"}
                                            </td>
                                        )
                                    case "open_by":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                {rnc.open_by.name ?? "-"}
                                            </td>
                                        );
                                    case "role":
                                        return(
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                {rnc.open_by.role ?? "-"}
                                            </td>
                                        )
                                    default:
                                        return(
                                            <td key={col.key} className="py-3 px-4 font-medium text-gray-800">
                                                {value === null || value === undefined
                                                    ? "-"
                                                    : (typeof value === "object" ? JSON.stringify(value) : String(value))
                                                }
                                            </td>
                                        );
                                    }
                            })}
                        </motion.tr>
                    ))}
                </tbody>
            </motion.table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if(!status) return <span className="text-gray-400">-</span>

    const colorMap: Record<string, string> = {
        aberto: "bg-blue-100 text-blue-800",
        fechado: "bg-green-100 text-green-800",
    }

    const color = colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-700";

    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {status}
        </span>
    )
}

function ConditionBadge({ condition } : { condition: string }) {
    if(!condition) return <span className="text-gray-400">-</span>

    const colorMap: Record<string, string> = {
        aprovado: "bg-green-100 text-green-800",
        retrabalho: "bg-yellow-100 text-yellow-800",
        em_analise: "bg-gray-100 text-gray-800",
        refugo: "bg-red-100 text-red-800"
    };

    const color = colorMap[condition.toLowerCase()] || "bg-gray-100 text-gray-700";

    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {condition}
        </span>
    )
}