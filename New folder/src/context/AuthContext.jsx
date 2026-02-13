import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authApi.login({ username, password });
            const { token, id, username: userName, email, role } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ id, username: userName, email, role }));

            setUser({ id, username: userName, email, role });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);
            const { token, id, username, email, role } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ id, username, email, role }));

            setUser({ id, username, email, role });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = () => !!user;
    const hasRole = (role) => user?.role === role;
    const hasAnyRole = (roles) => roles.includes(user?.role);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            isAuthenticated,
            hasRole,
            hasAnyRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};