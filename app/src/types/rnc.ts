import type { User } from "./user";
import type { Part } from "./part";

export interface RNCReadComplete{
    id: number;
    num_rnc: number;
    title: string;
    status: string;
    condition: string;
    critical_level: string;
    observations:string;

    //Informações da peça
    part_id: number;
    part_code: string;
    part: Part;

    //Informações de abertura
    open_by_id: number;
    open_by: User;
    date_of_occurrence: string;

    //Informações de análise da qualidade
    root_cause: string;
    corrective_action: string;
    preventive_action: string;
    analysis_observations: string;
    analysis_date: string;
    estimated_rework_time: number;
    requires_external_support: boolean;
    quality_verified: boolean;

    //Informações de retrabalho
    rework_description: string;
    actions_taken: string;
    materials_used: string;
    time_spent: number;
    rework_observations: string;
    rework_date: string;

    //Informações de responsável atual
    current_responsible_id: number;

    //Informações de fechamento
    closed_by_id: number;
    closed_by: User;
    closing_date: string;
    closing_notes: string;
}

export interface RNCReadSimple{
    id: number;
    num_rnc: number;
    title: string;
    status: string;
    condition: string;
    critical_level: string;
    part_code: string;
    date_of_occurrence: string;
    closing_date: string;
    open_by_id: number;
    open_by: User
}

export interface RNCReadWithPart{
    id: number;
    num_rnc: number;
    title: string;
    status: string;
    condition: string;
    critical_level: string;
    observations: string;
    analysis_observations: string;
    rework_description: string;
    part_code: string;
    part: Part;
    analysis_date: string;
    rework_date: string;
    date_of_occurrence: string;
    closing_date: string;
}

export interface RNCListResponse{
    items: RNCReadSimple[]
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface Statistics{
    total_rncs: number;
    open_rncs: number;
    closed_rncs: number;
    approved_rncs: number;
    refused_rncs: number;
    average_resolution_time: number;

    monthly: [{month: string; count: number}]
    by_status: [{status: string; total: number}]
    by_condition: [{condition: string; total: number}]
}