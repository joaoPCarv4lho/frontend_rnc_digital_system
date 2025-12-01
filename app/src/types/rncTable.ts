import type { RNCReadSimple } from "./rnc";

export interface Column{
    key: string;
    label: string;
    render?: (rnc: RNCReadSimple) => React.ReactNode
}
export interface RNCTableProps {
    rncs: RNCReadSimple[];
    situation?: string;
    columns: Column[];
}