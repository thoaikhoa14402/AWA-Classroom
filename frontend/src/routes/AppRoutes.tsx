import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import Classes from "~/pages/Classes";
import HomePage from "~/pages/Home";
import Profile from "~/pages/Profile";
import SearchPage from "~/pages/Search";
import LoginPage from "~/pages/Login";
import RegisterPage from "~/pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "~/pages/Landing";

const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
             <Route path="/" element={<LandingPage />} />
             <Route element={<ProtectedRoute auth />}>
                <Route element={<BaseLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/classes">
                        <Route path=":class_id?" element={<Classes />} />    
                    </Route>
                    <Route path="/schedule" element={<>Schedule</>} />
                    <Route path="/settings" element={<>Settings</>} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/user/profile" element={<Profile />} />
                </Route>
            </Route>
            {/* Authentication routes */}
            <Route element={<ProtectedRoute />}>
                <Route path = "/auth" element = {<AuthLayout/>}>
                    <Route index element = {<LoginPage/>}/>
                    <Route path = "login" element = {<LoginPage/>}/>
                    <Route path = "register" element = {<RegisterPage/>}/>
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />}  />
        </Routes>
    );
};

export default AppRoutes;
