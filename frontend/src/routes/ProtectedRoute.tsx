import axios from "axios";
import { useEffect } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import useAppDispatch from "~/hooks/useAppDispatch";
import useAuth from "~/hooks/useAuth"
import { setUserProfile } from "~/store/reducers/userSlice";
import authStorage from "~/utils/auth.storage";

interface ProtectProps {
    auth?: boolean;
}
  
const ProtectedRoute: React.FC<ProtectProps> = ({ auth = false }: ProtectProps) => {
    const [searchParams, _] = useSearchParams();
    const dispatch = useAppDispatch();
    const { isAuthenticated, isFetching } = useAuth(); // check if the user is authenticated or not (based on cookie)

    useEffect(() => { 
        
        if (!isFetching && isAuthenticated && !authStorage.isLogin()) {
            const controller = new AbortController();

            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                },
                signal: controller.signal
            })
            .then(res => {
                dispatch(setUserProfile(res.data.data));
            })
            .catch(error => console.log(error));
        }
    });

    if (!searchParams.get('u_id') && !auth) { // Trường hợp từ Home -> Login page (đăng nhập = tài khoản thường không phải Social OAuth)
        if (!isFetching && isAuthenticated)
            return <Navigate to="/home" replace />
        
        if (isFetching)
            return null;
    }
    
    if (auth && !authStorage.isLogin()) {
        return <Navigate to = "/auth/login" replace />;
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