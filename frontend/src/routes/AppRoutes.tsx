import { Routes, Route } from "react-router-dom";
import BaseLayout from "~/layouts/BaseLayout";

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
        </Routes>
    );
};

export default AppRoutes;
