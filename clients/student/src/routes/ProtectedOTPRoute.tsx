import useOTP from "~/hooks/useOTP";
import { Navigate, Outlet } from "react-router-dom";
import authStorage from "~/utils/auth.storage";

const ProtectedOTPRoute: React.FC = () => {
    const verificationToken = useOTP();
    if (!verificationToken && !authStorage.isLogin()) {  // if user is not authenticated via OTP and not logged in
        return <Navigate to="/auth/login" replace/>;
    }
    if (!verificationToken && authStorage.isLogin()) { // if user is authenticated via OTP and logged in
        return <Navigate to="/home" replace/>;
    }
    return <Outlet/>
}

export default ProtectedOTPRoute;