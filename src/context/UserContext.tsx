import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export default interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    picture: string;
    token: string;
}

interface UserContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

// Cria o contexto com valores iniciais
const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        // Carrega o usuário do localStorage ao inicializar
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Atualiza o localStorage sempre que o estado do usuário mudar
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Remove o token, se estiver armazenado separadamente
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
