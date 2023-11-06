import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "~/components/Navbar/Navbar";
import classes from "./BaseLayout.module.css";
import Footer from "~/components/Footer/Footer";

const BaseLayout = () => {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default BaseLayout;
