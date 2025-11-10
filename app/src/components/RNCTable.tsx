import type { RNCTableProps } from "../types/rncTable";


export const RNCTable = ({rncs, situation}: RNCTableProps) => {
    if (!rncs.length){
        return <p className="text-center text-gray-500 mt-6">Nenhum RNC {situation} ainda</p>
    }

    return(
        <table className="min-w-full mt-6 border border-gray-300 bg-white rounded-lg shadow">
            <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-3 border-b">Número</th>
                    <th className="py-2 px-3 border-b">Título</th>
                    <th className="py-2 px-3 border-b">Peça</th>
                    <th className="py-2 px-3 border-b">Status</th>
                    <th className="py-2 px-3 border-b">Condição</th>
                    <th className="py-2 px-3 border-b">Data de abertura</th>
                </tr>
            </thead>
            <tbody>
                {rncs.map((rnc)=>(
                    <tr key={rnc.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-b">{rnc.num_rnc}</td>
                        <td className="py-2 px-3 border-b">{rnc.title}</td>
                        <td className="py-2 px-3 border-b">{rnc.part.part_code}</td>
                        <td className="py-2 px-3 border-b">{rnc.status}</td>
                        <td className="py-2 px-3 border-b">{rnc.condition}</td>
                        <td className="py-2 px-3 border-b">{rnc.opening_date? new Date(rnc.opening_date).toLocaleDateString() : "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}