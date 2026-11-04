import type {
    RNCReadSimple,
    RNCReadWithPart,
    RNCListResponse,
    Statistics,
} from "../types/rnc";
import type { Part } from "../types/part";
import { mockUsers } from "./mockUsers";

const operador = mockUsers.find((u) => u.role === "operador")!;

const mockParts: Part[] = [
    { id: 1, part_code: "PC-1001", description: "Bloco de motor fundido", client: "MetalCorp", active: true },
    { id: 2, part_code: "PC-1002", description: "Flange de aço usinada", client: "AutoPeças SA", active: true },
    { id: 3, part_code: "PC-1003", description: "Carcaça de bomba", client: "HidroTech", active: true },
    { id: 4, part_code: "PC-1004", description: "Eixo virabrequim", client: "MotorParts", active: true },
    { id: 5, part_code: "PC-1005", description: "Suporte estrutural", client: "MetalCorp", active: true },
];

/** Data helper: dias atrás a partir de hoje, em ISO. */
function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

/**
 * Lista central de RNCs mockados. As demais respostas (listas por status/condição
 * e estatísticas) são derivadas desta base.
 */
export const mockRncs: RNCReadSimple[] = [
    {
        id: 1, num_rnc: 2024001, title: "Porosidade excessiva no bloco",
        status: "aberto", condition: "em_analise", critical_level: "alto",
        part_code: "PC-1001", date_of_occurrence: daysAgo(2), closing_date: "",
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 2, num_rnc: 2024002, title: "Dimensão fora de tolerância na flange",
        status: "fechado", condition: "aprovado", critical_level: "medio",
        part_code: "PC-1002", date_of_occurrence: daysAgo(12), closing_date: daysAgo(6),
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 3, num_rnc: 2024003, title: "Trinca na carcaça da bomba",
        status: "fechado", condition: "refugo", critical_level: "alto",
        part_code: "PC-1003", date_of_occurrence: daysAgo(20), closing_date: daysAgo(15),
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 4, num_rnc: 2024004, title: "Acabamento superficial irregular",
        status: "aberto", condition: "retrabalho", critical_level: "baixo",
        part_code: "PC-1004", date_of_occurrence: daysAgo(1), closing_date: "",
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 5, num_rnc: 2024005, title: "Furação com diâmetro incorreto",
        status: "fechado", condition: "aprovado", critical_level: "medio",
        part_code: "PC-1005", date_of_occurrence: daysAgo(30), closing_date: daysAgo(22),
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 6, num_rnc: 2024006, title: "Inclusão de escória no eixo",
        status: "aberto", condition: "retrabalho", critical_level: "alto",
        part_code: "PC-1004", date_of_occurrence: daysAgo(4), closing_date: "",
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 7, num_rnc: 2024007, title: "Rebarba não removida",
        status: "fechado", condition: "refugo", critical_level: "baixo",
        part_code: "PC-1002", date_of_occurrence: daysAgo(18), closing_date: daysAgo(10),
        open_by_id: operador.id, open_by: operador,
    },
    {
        id: 8, num_rnc: 2024008, title: "Desvio de concentricidade",
        status: "fechado", condition: "aprovado", critical_level: "medio",
        part_code: "PC-1001", date_of_occurrence: daysAgo(25), closing_date: daysAgo(17),
        open_by_id: operador.id, open_by: operador,
    },
];

function toListResponse(items: RNCReadSimple[]): RNCListResponse {
    return {
        items,
        total: items.length,
        page: 1,
        page_size: 10,
        total_pages: 1,
    };
}

/** RNCs abertos pelo operador (painel do operador). */
export const openRncsResponse: RNCListResponse = toListResponse(mockRncs);

/** RNCs em análise / analisados (painéis de qualidade e engenharia). */
export const analysisRncsResponse: RNCListResponse = toListResponse(
    mockRncs.filter((r) => r.condition === "aprovado" || r.condition === "refugo")
);

/** RNCs pendentes de retrabalho (painel técnico). */
export const toBeReworkedResponse: RNCListResponse = toListResponse(
    mockRncs.filter((r) => r.condition === "retrabalho")
);

/** RNCs já retrabalhados pelo técnico (painel técnico). */
export const reworkedResponse: RNCListResponse = toListResponse(
    mockRncs.filter((r) => r.condition === "retrabalho" && r.status === "aberto")
);

/** Estatísticas agregadas (painel administrativo). */
export const mockStatistics: Statistics = {
    total_rncs: mockRncs.length,
    open_rncs: mockRncs.filter((r) => r.status === "aberto").length,
    closed_rncs: mockRncs.filter((r) => r.status === "fechado").length,
    approved_rncs: mockRncs.filter((r) => r.condition === "aprovado").length,
    refused_rncs: mockRncs.filter((r) => r.condition === "refugo").length,
    average_resolution_time: 7,
    monthly: [{ month: "Set", count: mockRncs.length }],
    by_status: [{ status: "aberto", total: mockRncs.filter((r) => r.status === "aberto").length }],
    by_condition: [{ condition: "aprovado", total: mockRncs.filter((r) => r.condition === "aprovado").length }],
};

/** Detalhe de um RNC com informações da peça (usado pelos modais de busca). */
export function findRncWithPartByCode(partCode: string): RNCReadWithPart | undefined {
    const rnc = mockRncs.find((r) => r.part_code === partCode);
    const part = mockParts.find((p) => p.part_code === partCode);
    if (!rnc || !part) return undefined;

    return {
        id: rnc.id,
        num_rnc: rnc.num_rnc,
        title: rnc.title,
        status: rnc.status,
        condition: rnc.condition,
        critical_level: rnc.critical_level,
        observations: "Observação registrada na abertura do RNC.",
        analysis_observations: "Análise técnica em andamento.",
        rework_description: "",
        part_code: rnc.part_code,
        part,
        analysis_date: rnc.date_of_occurrence,
        rework_date: "",
        date_of_occurrence: rnc.date_of_occurrence,
        closing_date: rnc.closing_date,
    };
}

export function findPartByCode(partCode: string): Part | undefined {
    return mockParts.find((p) => p.part_code === partCode);
}
