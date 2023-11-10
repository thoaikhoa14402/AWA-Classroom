import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import LoginPage from "~/pages/LoginPage/LoginPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/" element={<></>} />
            </Route>
            <Route path = '/login' element = {<LoginPage/>}></Route>
        </Routes>
    );
};

export default AppRoutes;
