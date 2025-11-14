import type { RNC } from "./rnc";

export interface Column{
    key: string;
    label: string;
    render?: (rnc: RNC) => React.ReactNode
}
export interface RNCTableProps {
    rncs: RNC[];
    situation?: string;
    columns: Column[];
}