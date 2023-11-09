import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "~/components/Navbar/Navbar";
import Footer from "~/components/Footer/Footer";

import "./BaseLayout.module.css";

const BaseLayout: React.FC = () => {
    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
};

export default BaseLayout;

