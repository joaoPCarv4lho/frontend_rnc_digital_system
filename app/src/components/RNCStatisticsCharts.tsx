import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"
import type { Statistics } from "../types/rnc";

export function RNCStatisticsCharts({ statistics }: { statistics: Statistics }){
    const COLORS = ["#2563eb", "#16a34a", "#eab308", "#dc2626", "#6b7280"];

    const byStatus = [
        { status: "Aberto", total: statistics.open_rncs },
        { status: "Fechado", total: statistics.closed_rncs },
    ];

    const byCondition = [
        { condition: "aprovado", total: statistics.approved_rncs },
        { condition: "refugo", total: statistics.refused_rncs },
    ];

    const monthly = [
        { month: "Jan", count: statistics.total_rncs }, // placeholder
    ];

    return(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/**Gráfico de Linha */}
            <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="text-lg font-semibold mb-4">RNCs por mês</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/**Gráfico de barras */}
            <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="text-lg font-semibold mb-4">RNCs por Status</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total">
                            {byStatus.map((_, index)=> (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/**Gráfico de Pizza */}
            <div className="bg-white p-6 rounded-xl shadow border col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">RNCs por Condição</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={byCondition} dataKey="total" nameKey="condition" outerRadius={120} label>
                            {byCondition.map((_, index)=> (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}