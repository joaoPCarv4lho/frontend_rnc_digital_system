import type { RNCListResponse, Statistics } from "./rnc";
import type { Column } from "./rncTable";


export type RNCSectionProps = 
| { mode: "list";
    title: string;
    rncs: RNCListResponse;
    situation: string;
    loading: boolean;
    typeColumns: Column[];
}
| {
    mode: "stats";
    title: string;
    rncs: Statistics;
    loading: boolean;
}