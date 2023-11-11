import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import Classes from "~/pages/Classes";
import HomePage from "~/pages/Home";
import Profile from "~/pages/Profile";
import SearchPage from "~/pages/Search";
import LoginPage from "~/pages/LoginPage/LoginPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/classes">
                    <Route path=":class_id?" element={<Classes />} />    
                </Route>
                <Route path="/schedule" element={<>Schedule</>} />
                <Route path="/settings" element={<>Settings</>} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path = '/login' element = {<LoginPage/>}></Route>
        </Routes>
    );
};

export default AppRoutes;
