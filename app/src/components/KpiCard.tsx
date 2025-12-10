

export function KpiCard({
    title, 
    value,
    icon,
    color
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
}) {
    return(
    <div className={`flex items-center justify-between p-5 rounded-2xl shadow-sm border border-gray-200 ${color}`}>
        <div>
            <h3 className="text-sm text-gray-600">{title}</h3>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-full shadow-inner">{icon}</div>
    </div>
    )
}