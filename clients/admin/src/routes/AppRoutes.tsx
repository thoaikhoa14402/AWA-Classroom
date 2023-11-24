import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import Classes from "~/pages/Classes";
import LoginPage from "~/pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "~/pages/Dashboard";
import StudentManagementPage from "~/pages/StudentManagement";
import LecturerManagementPage from "~/pages/LecturerManagement";
import ClassroomManagementPage from "~/pages/ClassroomManagement"
import SchedulePage from '~/pages/Schedule';
import SettingPage from '~/pages/Setting';


const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
             <Route element={<BaseLayout />}>
                <Route path="/dashboard" element={<DashboardPage />}></Route>
                <Route path="/classroom-management" element={<ClassroomManagementPage/>}></Route>
                <Route path="/lecturer-management" element={<LecturerManagementPage/>}></Route>
                <Route path="/student-management" element={<StudentManagementPage/>}></Route>
                <Route path="/schedule" element={<SchedulePage/>}></Route>
                <Route path="/settings" element={<SettingPage/>}></Route>
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
