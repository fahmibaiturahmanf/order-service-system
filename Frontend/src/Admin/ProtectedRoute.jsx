import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthStatus } from '../utils/auth';

const ProtectedRoute = ({ allowedRole, redirectPath = '/login', children }) => {
    const { isAuthenticated, userRole, isRoleMatched } = getAuthStatus(allowedRole);

    console.log(`ProtectedRoute: Checking access for role: ${allowedRole}`);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('userRole (from valid token):', userRole);
    console.log('isRoleMatched (with allowedRole):', isRoleMatched);

    if (!isAuthenticated || !isRoleMatched) {
        console.error(`ProtectedRoute: Access DENIED. Expected role: ${allowedRole}, Current authenticated role: ${userRole}`);
        return <Navigate to={redirectPath} replace />;
    }

    console.log('ProtectedRoute: Access GRANTED.');
    return children ? children : <Outlet />;
};

export default ProtectedRoute;