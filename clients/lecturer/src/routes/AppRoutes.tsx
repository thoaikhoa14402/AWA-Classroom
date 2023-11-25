import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import HomePage from "~/pages/Home";
import Profile from "~/pages/Profile";
import SearchPage from "~/pages/Search";
import LoginPage from "~/pages/Login";
import RegisterPage from "~/pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import OTPVerificationPage from "~/pages/OTPVerification";
import ProtectedOTPRoute from "./ProtectedOTPRoute";
import ResetPassword from "~/pages/ResetPassword";
import ForgotPasswordPage from "~/pages/ForgotPassword";
import RenewPasswordPage from "~/pages/RenewPassword";
import ClassLayout from "~/layouts/ClassLayout";
import Member from "~/pages/Class/Member";
import Invite from "~/pages/Invite";

const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
             <Route element={<ProtectedRoute auth />}>
                <Route element={<BaseLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/classes" element={<ClassLayout />}>
                        <Route path="feeds/:classID?" element={<>FEEDS</>} />    
                        <Route path="works/:classID?" element={<>WORKS</>} />    
                        <Route path="members/:classID?" element={<Member />} />    
                        <Route path="grades/:classID?" element={<>GRADES</>} />    
                        <Route path="invite/:classID?" element={<Invite />} />    
                    </Route>
                    <Route path="/schedule" element={<>Schedule</>} />
                    <Route path="/settings" element={<>Settings</>} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/user/profile" element={<Profile />} />
                    <Route path="/user/reset-password" element={<ResetPassword />} />
                </Route>
            </Route>
            {/* Authentication routes */}
            <Route element={<ProtectedRoute />}>
                <Route path = "/auth" element = {<AuthLayout/>}>
                    <Route index element = {<LoginPage/>}/>
                    <Route path = "login" element = {<LoginPage/>}/>
                    <Route path = "register" element = {<RegisterPage/>}/>
                    <Route element={<ProtectedOTPRoute/>}>
                        <Route path = "otp-verification">
                            <Route path = "register" element = {<OTPVerificationPage type = "register"/>}/>
                            <Route path = "forgot" element = {<OTPVerificationPage type = "forgot"/>}/>
                        </Route>
                        <Route path = "renew-password" element = {<RenewPasswordPage/>}/>
                    </Route>
                    <Route path = "forgot-password" element = {<ForgotPasswordPage/>}/>
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/home" />}  />
        </Routes>
    );
};

export default AppRoutes;
