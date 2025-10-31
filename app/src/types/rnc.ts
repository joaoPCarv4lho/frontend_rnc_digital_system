import type { User } from "./user";
import type { Part } from "./part";


export interface RNC{
    num_rnc: number;
    title: string;
    status: string;
    condition: string;
    observations?: string;
    part_id: number;
    open_by_id: number;
    current_responsible?: User;
    closed_by_id?: number;
    opening_date: Date;
    closing_date: Date;
    part: Part;
    open_by: User;
    closed_by?: User;
}