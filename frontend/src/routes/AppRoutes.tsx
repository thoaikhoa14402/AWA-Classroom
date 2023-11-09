import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<BaseLayout />}>
                <Route path="/" element={<>Test body content</>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
