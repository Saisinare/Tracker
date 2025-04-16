import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getProfile } from '../utils/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getProfile()
                .then((response) => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .then(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await apiLogin(email, password);
            const authData = response.data;
            localStorage.setItem('token', authData.token);
            setUser(authData.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
            throw err;
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        try {
            setError(null);
            const response = await apiSignup(username, email, password);
            const authData = response.data;
            localStorage.setItem('token', authData.token);
            setUser(authData.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to signup');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 