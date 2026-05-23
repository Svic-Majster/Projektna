import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';
import type {
    AuthResult,
    LoginPayload,
    RegisterPayload,
    User,
} from '../types/auth';

const STORAGE_KEY = '@svicmajster_user';

type UseAuthReturn = {
    user: User | null;
    loading: boolean;
    login: (payload: LoginPayload) => Promise<AuthResult>;
    register: (payload: RegisterPayload) => Promise<AuthResult>;
    logout: () => Promise<void>;
};

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        restoreUser();
    }, []);

    const restoreUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem(STORAGE_KEY);

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Napaka pri branju uporabnika iz shrambe:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (payload: LoginPayload): Promise<AuthResult> => {
        try {
            const data = await authService.login(payload);

            setUser(data.user);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));

            return {
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                error instanceof Error ? error.message : 'Prijava ni uspela.',
            };
        }
    };

    const register = async (payload: RegisterPayload): Promise<AuthResult> => {
        try {
            const data = await authService.register(payload);

            return {
                success: true,
                message: data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                error instanceof Error ? error.message : 'Registracija ni uspela.',
            };
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    return {
        user,
        loading,
        login,
        register,
        logout,
    };
}
