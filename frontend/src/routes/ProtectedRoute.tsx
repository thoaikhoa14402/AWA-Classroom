import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import useAuth from "~/hooks/useAuth"
import authStorage from "~/utils/auth.storage";

interface ProtectProps {
    auth?: boolean;
}
  
const ProtectedRoute: React.FC<ProtectProps> = ({ auth = false }: ProtectProps) => {
    const [searchParams, _] = useSearchParams();
    const { isAuthenticated, isFetching } = useAuth(); // check if the user is authenticated or not (based on cookie)

    if (!searchParams.get('u_id') && !auth) { 
        if (!isFetching && isAuthenticated)
            return <Navigate to="/home" />
        
        if (isFetching)
            return null;
    }
    
    if (auth && !authStorage.getUserProfile()) {
        return <Navigate to = "/auth/login" />;
    }

    if (auth && authStorage.getUserProfile()) {
        if (!isFetching && !isAuthenticated) {
            return <Navigate to = "/auth/login" />;
        }
        
        if (isFetching)
            return null;
    }

    return <Outlet />;
}

export default ProtectedRoute;