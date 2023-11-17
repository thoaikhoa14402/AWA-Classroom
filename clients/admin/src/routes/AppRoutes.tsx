import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import Classes from "~/pages/Classes";
import LoginPage from "~/pages/Login";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
            {/* Authentication routes */}
            <Route element={<ProtectedRoute />}>
                <Route path = "/auth" element = {<AuthLayout/>}>
                    <Route index element = {<LoginPage/>}/>
                    <Route path = "login" element = {<LoginPage/>}/>
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />}  />
        </Routes>
    );
};

export default AppRoutes;
