import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/" element={<></>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
