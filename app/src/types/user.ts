export type UserRole = 
    | "admin"
    | "qualidade"
    | "engenharia"
    | "operador"
    | "tecnico_fundicao"
    | "tecnico_usinagem";


export interface User{
    id: number;
    name: string;
    password: string;
    email: string;
    role: UserRole;
    active: boolean;
}

export interface UserWithoutPassword{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
}

export interface UserLoginResponse{
    token: string;
    user: UserWithoutPassword;
}

export interface UserRegisterData{
    name: string;
    password: string;
    email: string;
    role: UserRole;
    active: boolean;
}

export interface UserLoginData{
    email: string;
    password: string;
}