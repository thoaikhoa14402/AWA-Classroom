import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import Classes from "~/pages/Classes";
import LoginPage from "~/pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "~/pages/Dashboard";
import StudentManagement from "~/pages/StudentManagement";
import LecturerManagement from "~/pages/LecturerManagement";
import ClassroomManagement from "~/pages/ClassroomManagement";

const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
             <Route element={<BaseLayout />}>
                <Route path="/dashboard" element={<DashboardPage />}></Route>
                <Route path="/classroom-management" element={<ClassroomManagement/>}></Route>
                <Route path="/student-management" element={<StudentManagement/>}></Route>
                <Route path="/lecturer-management" element={<LecturerManagement/>}></Route>
             </Route>
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
