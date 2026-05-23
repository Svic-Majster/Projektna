import { apiRequest } from '../lib/api';
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
} from '../types/auth';

export const authService = {
    async login(payload: LoginPayload) {
        return apiRequest<AuthResponse>({
            path: '/auth/login',
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async register(payload: RegisterPayload) {
        return apiRequest<AuthResponse>({
            path: '/auth/register',
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
};
