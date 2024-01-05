import React from 'react';

import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import useAuth from "~/hooks/useAuth"
import authStorage from "~/utils/auth.storage";

interface ProtectProps {
    auth?: boolean;
}
  
const ProtectedRoute: React.FC<ProtectProps> = ({ auth = false }: ProtectProps) => {
    const [searchParams, _] = useSearchParams();
    const { isAuthenticated, isFetching } = useAuth(); // check if the user is authenticated or not (based on cookie)

    if (auth && !authStorage.isLogin()) {
        return <Navigate to = "/auth/login" replace />;
    }

    if (!auth && !searchParams.get('u_id')) { // Trường hợp từ Home -> Login page (đăng nhập = tài khoản thường không phải Social OAuth)
        if (!isFetching && isAuthenticated)
            return <Navigate to="/classroom-management" replace />
        
        if (isFetching)
            return null;
    }
    
    if (auth && authStorage.isLogin()) {    
        if (!isFetching && !isAuthenticated) {
            return <Navigate to = "/auth/login" replace />;
        }
        
        if (isFetching)
            return null;
    }

    return <Outlet />;
}

export default ProtectedRoute;