import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/auth.service';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Optionally verify with backend
                // const userData = await authService.getCurrentUser();
                // setUser(userData);

                // For now, just use decoded token or minimal user object
                setUser({
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role || 'free',
                    name: decoded.name || 'Usuário',
                    ...decoded
                });
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            const decoded = jwtDecode(data.token);
            setUser({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role || 'free',
                name: decoded.name || 'Usuário',
                ...decoded
            });
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            const decoded = jwtDecode(data.token);
            setUser({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role || 'free',
                name: decoded.name || 'Usuário',
                ...decoded
            });
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
