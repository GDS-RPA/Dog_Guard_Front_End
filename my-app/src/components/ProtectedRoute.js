import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" />;
    }

    const decodedToken = jwtDecode(token);
    const { role } = decodedToken;

    return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/login" />;
};
export default ProtectedRoute;
