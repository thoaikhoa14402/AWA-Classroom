import React from "react";
import {  faArrowRight, faArrowRightToBracket, faBars, faSignIn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./Navbar.module.css";
import { NavLink } from "react-router-dom";

interface NavbarProps {
    toggleSidebar: () => void
}

const Navbar: React.FC<NavbarProps> = (props) => {

    return (
        <nav className="bg-white w-screen flex justify-center shadow-sm px-4 sticky top-0 z-10">
            <div
                className={ 
                    "max-w-screen-2xl w-screen flex flex-col sm:flex-row justify-between items-center py-3 gap-3 lg:gap-0"
                }
            >
                <div className="flex items-center gap-3">
                    <button type="button" title="Menu" onClick={props.toggleSidebar} className="rounded-full px-3 py-3 flex justify-center items-center hover:bg-slate-100 transition-all duration-300"><FontAwesomeIcon icon={faBars} width={16} color="grey" /></button>
                    {/* <img src="rocket.png" alt="Logo" className="w-8 h-8 mr-2" /> */}
                    <a href="/" className="text-primary text-xl font-medium">
                        AWA Classroom
                    </a>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-2 font-medium text-sm hover:text-hover-dark transition-all duration-75">Sign Up</button>
                    <button className="flex items-center gap-1.5 px-5 py-2 outline-none border-2 font-semibold border-primary rounded-full text-white text-sm bg-primary hover:shadow-lg hover:border-transparent disabled:bg-gray-400/80 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:bg-hover">
                        Sign In <FontAwesomeIcon icon={faArrowRight} /> 
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
