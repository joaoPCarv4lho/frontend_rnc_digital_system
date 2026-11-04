import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";

import { findUserByEmail, stripPassword } from "./mockUsers";
import {
    openRncsResponse,
    analysisRncsResponse,
    toBeReworkedResponse,
    reworkedResponse,
    mockStatistics,
    findRncWithPartByCode,
    findPartByCode,
} from "./mockRncs";

const LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> {
    return {
        data,
        status,
        statusText: status === 201 ? "Created" : "OK",
        headers: {},
        config,
        request: {},
    };
}

function fail(
    config: InternalAxiosRequestConfig,
    status: number,
    detail: string
): AxiosError {
    const response: AxiosResponse = {
        data: { detail, error: detail, message: detail },
        status,
        statusText: "Error",
        headers: {},
        config,
        request: {},
    };
    return new AxiosError(detail, String(status), config, {}, response);
}

/** Normaliza a URL removendo a baseURL e query string. */
function normalizePath(config: InternalAxiosRequestConfig): string {
    let url = config.url ?? "";
    url = url.replace(/^https?:\/\/[^/]+/i, "");
    url = url.split("?")[0];
    if (!url.startsWith("/")) url = "/" + url;
    return url.replace(/\/+$/, "") || "/";
}

/**
 * Adapter de mock para o Axios: intercepta as chamadas e devolve dados
 * simulados, permitindo rodar o app sem backend (ideal para prints/portfólio).
 */
export const mockAdapter: AxiosAdapter = async (config) => {
    const method = (config.method ?? "get").toLowerCase();
    const path = normalizePath(config);

    const body =
        typeof config.data === "string"
            ? safeParse(config.data)
            : (config.data as Record<string, unknown> | undefined) ?? {};

    // ---------------- AUTH ----------------
    if (method === "post" && path === "/auth/login") {
        const email = String(body.email ?? "");
        const user = findUserByEmail(email);
        if (!user || !user.active) {
            throw fail(config, 401, "Credenciais inválidas.");
        }
        return delay(
            ok(
                {
                    access_token: `mock-token-${user.role}-${user.id}`,
                    user: stripPassword(user),
                },
                config
            )
        );
    }

    if (method === "post" && path === "/auth/refresh") {
        return delay(ok({ access_token: "mock-token-refreshed" }, config));
    }

    // ---------------- USUÁRIOS ----------------
    if (method === "post" && path === "/user/register") {
        return delay(ok({ detail: "Usuário registrado com sucesso!" }, config, 201));
    }

    // ---------------- RNCs (listas) ----------------
    if (method === "get" && path === "/rnc/statistics") {
        return delay(ok(mockStatistics, config));
    }
    if (method === "get" && path === "/rnc/list/open/user") {
        return delay(ok(openRncsResponse, config));
    }
    if (method === "get" && path === "/rnc/list/analysis/user") {
        return delay(ok(analysisRncsResponse, config));
    }
    if (method === "get" && path === "/rnc/list/to_be_reworked") {
        return delay(ok(toBeReworkedResponse, config));
    }
    if (method === "get" && path === "/rnc/list/rework/user") {
        return delay(ok(reworkedResponse, config));
    }

    // ---------------- RNCs / Peças (detalhe p/ modais) ----------------
    if (method === "get" && path.startsWith("/rnc/partCode/")) {
        const code = decodeURIComponent(path.replace("/rnc/partCode/", ""));
        const rnc = findRncWithPartByCode(code);
        if (!rnc) throw fail(config, 404, "RNC não encontrado para esse código.");
        return delay(ok(rnc, config));
    }
    if (method === "get" && path.startsWith("/part/code/")) {
        const code = decodeURIComponent(path.replace("/part/code/", ""));
        const part = findPartByCode(code);
        if (!part) throw fail(config, 404, "Peça não encontrada.");
        return delay(ok(part, config));
    }

    // ---------------- RNCs (mutações) ----------------
    if (method === "post" && path === "/rnc/create_rnc") {
        return delay(ok({ detail: "RNC criado com sucesso!" }, config, 201));
    }
    if (method === "patch" && path.startsWith("/rnc/analysis/")) {
        return delay(ok({ detail: "Análise registrada com sucesso!" }, config));
    }
    if (method === "patch" && path.startsWith("/rnc/rework/")) {
        return delay(ok({ detail: "Retrabalho registrado com sucesso!" }, config));
    }

    // ---------------- fallback ----------------
    throw fail(config, 404, `Endpoint não mockado: ${method.toUpperCase()} ${path}`);
};

function safeParse(raw: string): Record<string, unknown> {
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}
