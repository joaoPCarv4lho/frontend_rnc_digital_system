import type { User, UserRole, UserWithoutPassword } from "../types/user";

/**
 * Usuários mockados — um para cada role do sistema.
 *
 * Todos usam a mesma senha para facilitar a demonstração/portfólio: `senha123`.
 * O mock de login (ver `mockAdapter.ts`) valida apenas o e-mail; qualquer
 * senha é aceita, mas a senha "oficial" está documentada abaixo.
 */
export const MOCK_PASSWORD = "senha123";

export const mockUsers: User[] = [
    {
        id: 1,
        name: "Ana Administradora",
        email: "admin@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "admin",
        active: true,
    },
    {
        id: 2,
        name: "Quiteria Qualidade",
        email: "qualidade@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "qualidade",
        active: true,
    },
    {
        id: 3,
        name: "Eduardo Engenharia",
        email: "engenharia@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "engenharia",
        active: true,
    },
    {
        id: 4,
        name: "Otávio Operador",
        email: "operador@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "operador",
        active: true,
    },
    {
        id: 5,
        name: "Fábio Fundição",
        email: "fundicao@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "tecnico_fundicao",
        active: true,
    },
    {
        id: 6,
        name: "Ugo Usinagem",
        email: "usinagem@smarttrace.com",
        password: MOCK_PASSWORD,
        role: "tecnico_usinagem",
        active: true,
    },
];

export function stripPassword(user: User): UserWithoutPassword {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
}

export function findUserByEmail(email: string): User | undefined {
    return mockUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
}

export function findUserByRole(role: UserRole): User {
    return mockUsers.find((u) => u.role === role) ?? mockUsers[0];
}
