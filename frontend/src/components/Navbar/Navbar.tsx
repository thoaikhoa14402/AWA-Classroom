import React from "react";
import {  faArrowRight, faArrowRightToBracket, faSignIn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./Navbar.module.css";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
    return (
        <nav className="bg-white w-screen flex justify-center shadow-sm px-8">
            <div
                className={ 
                    "max-w-screen-2xl w-screen flex flex-col lg:flex-row justify-between items-center py-3"
                }
            >
                <div className="flex items-center">
                    {/* <img src="rocket.png" alt="Logo" className="w-8 h-8 mr-2" /> */}
                    <a href="/" className="text-primary text-2xl font-medium">
                        AWA Classroom
                    </a>
                </div>
                <div className="flex">
                    <button className="flex items-center gap-1.5 px-5 py-2 outline-none border-2 font-semibold border-primary rounded-full text-white text-sm bg-primary hover:shadow-lg hover:border-transparent disabled:bg-gray-400/80 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300">
                        Sign In <FontAwesomeIcon icon={faArrowRight} /> 
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
