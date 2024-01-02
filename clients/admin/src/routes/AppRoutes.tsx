import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import AuthLayout from "~/layouts/AuthLayout";
import LoginPage from "~/pages/Login";
import ProtectedRoute from "./ProtectedRoute";
// import DashboardPage from "~/pages/Dashboard";
import StudentManagementPage from "~/pages/StudentManagement";
import LecturerManagementPage from "~/pages/LecturerManagement";
import ClassroomManagementPage from "~/pages/ClassroomManagement"
import ClassroomDetailPage from "~/pages/ClassroomDetailPage"
// import SchedulePage from '~/pages/Schedule';
// import SettingPage from '~/pages/Setting';
import Profile from "~/pages/Profile";
import ResetPassword from "~/pages/ResetPassword";
import Error404 from "~/components/Error404";


const AppRoutes = () => {
    return (
        <Routes>
             {/* Protected routes */}
             <Route element={<ProtectedRoute auth />}>
                <Route element={<BaseLayout />}>
                    <Route path="/classroom-management">
                        <Route index element = {<ClassroomManagementPage/>}/>
                        <Route path = ":slug" element = {<ClassroomDetailPage/>}/>
                    </Route>
                    <Route path="/lecturer-management" element={<LecturerManagementPage/>}/>
                    <Route path="/student-management" element={<StudentManagementPage/>}/>
                    <Route path="/user/profile" element={<Profile />} />
                    <Route path="/user/reset-password" element={<ResetPassword />} />
                    <Route path="*" element={<Error404/>}  />
                </Route>
             </Route>
            {/* Authentication routes */}
            <Route element={<ProtectedRoute />}>
                <Route path = "/auth" element = {<AuthLayout/>}>
                    <Route index element = {<LoginPage/>}/>
                    <Route path = "login" element = {<LoginPage/>}/>
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/auth/login" />}  />
        </Routes>
    );
};

export default AppRoutes;
