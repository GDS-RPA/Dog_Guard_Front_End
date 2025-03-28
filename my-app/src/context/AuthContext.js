import React, { createContext, useState } from 'react';

// Tạo Context
export const AuthContext = createContext();

// Tạo Provider
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);

    // Hàm để đăng nhập (cập nhật token)
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('access_token', newToken);
    };

    // Hàm để đăng xuất (xóa token)
    const logout = () => {
        setToken(null);
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
