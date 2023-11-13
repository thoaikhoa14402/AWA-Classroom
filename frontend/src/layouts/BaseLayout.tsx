import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "~/components/Navbar/Navbar";
import Sidebar from "~/components/Sidebar/Sidebar";
import Footer from "~/components/Footer/Footer";

import "./BaseLayout.module.css";

const BaseLayout: React.FC = () => {

    const [sidebar, setSidebar] = useState<boolean>(true);

    const toggleSidebar = (option: string | boolean = 'toggle') => setSidebar((prev) => (option === 'toggle') ? !prev : option as boolean);

    return (
        <>
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="flex 2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto border-x border-gray-100">
                <Sidebar open={sidebar} />
                <div className={`w-full${sidebar ? ' !w-1/3 lg:!w-3/4 2xl:!w-4/5 md:!w-2/3 sm:!w-1/2' : ''} p-5`}>
                    <Outlet />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BaseLayout;

