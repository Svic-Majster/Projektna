export type User = {
    id: number;
    ime: string;
    priimek: string;
    username: string;
    email: string;
    skupnixp: number;
    trenutninivo: number;
    datumregistracije: string;
};

export type LoginPayload = {
    identifier: string;
    geslo: string;
};

export type RegisterPayload = {
    ime: string;
    priimek: string;
    username: string;
    email: string;
    geslo: string;
};

export type AuthResponse = {
    message: string;
    user: User;
};

export type AuthResult = {
    success: boolean;
    message?: string;
};
