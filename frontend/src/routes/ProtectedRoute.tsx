import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import useAuth from "~/hooks/useAuth"

  
const  ProtectedRoute = () => {
    const isAuthenticated = useAuth(); // check if the user is authenticated or not (based on cookie)
    if (!isAuthenticated && localStorage.getItem('user')) { // if the user was authenticated, but the cookie is expired
        return <Navigate to = "/auth/login" />;
    }
    return <Outlet/>;
}


export default ProtectedRoute;