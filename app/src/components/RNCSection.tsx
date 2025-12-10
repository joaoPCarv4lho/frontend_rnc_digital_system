import type { RNCSectionProps } from "../types/rncSection";
import { RNCTable } from "./RNCTable";

export function RNCSection(props: RNCSectionProps) {
    const { title, loading } = props
    return(
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>

            {loading && <p className="text-gray-500">Carregando...</p>}

            {!loading && props.mode === "stats" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-800">
                    <p>Total de RNCs: <strong>{props.rncs.total_rncs}</strong></p>
                    <p>RNCs Abertos: <strong>{props.rncs.open_rncs}</strong></p>
                    <p>RNCs Fechados: <strong>{props.rncs.closed_rncs}</strong></p>
                    <p>Tempo médio: <strong>{props.rncs.average_resolution_time} dias</strong></p>
                </div>
            )}

            {/** --- MODO LISTA (Operador, Qualidade, etc) */}
            {!loading && props.mode === "list" && (
                <>
                    {props.rncs.items.length === 0 ? (
                        <p className="text-gray-500">Nenhum Registro encontrado</p>
                    ) : (
                        <RNCTable rncs={props.rncs.items} situation={props.situation} columns={props.typeColumns} />
                    )}
                </>
            )}
        </div>
    )
}