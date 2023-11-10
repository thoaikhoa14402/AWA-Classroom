import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";
import LoginPage from "~/pages/LoginPage/LoginPage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/" element={<>Home page</>} />
                <Route path="/classes" element={<>Classes</>}>
                    <Route path=":id" element={<>Class with id</>} />    
                </Route>
                <Route path="/schedule" element={<>Schedule</>} />
                <Route path="/settings" element={<>Settings</>} />
            </Route>
            <Route path = '/login' element = {<LoginPage/>}></Route>
        </Routes>
    );
};

export default AppRoutes;
