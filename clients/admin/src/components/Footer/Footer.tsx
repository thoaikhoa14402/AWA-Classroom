import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import { NavLink } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <>
            <footer className="2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto flex gap-5 flex-wrap px-5 py-12 md:px-10 justify-between border-t border border-gray-100">
                <div className="flex flex-col w-screen md:w-1/3 gap-5">
                    <h1 className="text-xl font-semibold text-primary">
                        AWA Classroom
                    </h1>
                    <p className="font-sm text-justify text-sm">
                    The contemporary education platform features a user-friendly interface, empowering educators to effectively manage classrooms and foster seamless interaction with students. The harmonious blend of traditional methodologies and cutting-edge technology delivers a distinctive and enriching learning experience.
                    </p>
                </div>
                <div className="flex flex-col w-1/5 gap-5">
                    <b className="text-md font-semibold">Student</b>
                    <div className="flex flex-col gap-2 text-sm">
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/home"
                        >
                            Home
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/"
                        >
                            Landing page
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/register"
                        >
                            Sign In
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/login"
                        >
                            Sign Up
                        </NavLink>
                    </div>
                </div>
                <div className="flex flex-col w-1/5 gap-5">
                    <b className="text-md font-semibold">Teacher</b>
                    <div className="flex flex-col gap-2 text-sm">
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/home"
                        >
                            Home
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/"
                        >
                            Landing page
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/register"
                        >
                            Sign In
                        </NavLink>
                        <NavLink
                            className="hover:text-hover transition-all duration-75"
                            to="/login"
                        >
                            Sign Up
                        </NavLink>
                    </div>
                </div>
            </footer>
            <div className="2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto text-center p-4 font-semibold bg-primary text-white text-sm">
                2023 <FontAwesomeIcon icon={faCopyright} /> AWA Copyright
            </div>
        </>
    );
};

export default Footer;

