import React from "react";
import {  faArrowRight, faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classes from './Navbar.module.css';

interface NavbarProps {
    toggleSidebar: () => void
}

const Navbar: React.FC<NavbarProps> = (props) => {
    return (
        <nav className="bg-white w-screen flex justify-center shadow-sm px-4 sticky top-0 z-10">
            <div
                className={ 
                    "max-w-screen-2xl w-screen flex flex-col sm:flex-row justify-between items-center py-3 gap-3 lg:gap-0"
                }>
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <button type="button" title="Menu" onClick={props.toggleSidebar} className="rounded-full px-3 py-3 flex justify-center items-center hover:bg-slate-100 transition-all duration-300"><FontAwesomeIcon icon={faBars} width={16} color="grey" /></button>
                    {/* <img src="rocket.png" alt="Logo" className="w-8 h-8 mr-2" /> */}
                    <a href="/" className="text-primary text-xl font-medium">
                        AWA Classroom
                    </a>
                </div>
                <form autoComplete="off" className="w-1/2 bg-transparent flex justify-center items-center px-0.5 shadow-sm shadow-slate-200 overflow-hidden rounded-full" action='/' method='GET'>
                    <input required type="search" name="q" className="w-full px-3.5 py-2.5 text-sm outline-none" placeholder="Tìm kiếm lớp học, bài tập, ..." />
                    <button type="submit" className={`${classes['submit-btn']} bg-primary flex items-center p-3 border-none outline-none rounded-full font-bold`} title="Tìm kiếm">
                        <FontAwesomeIcon icon={faSearch} color="white" size="sm" />
                    </button>
                </form>
                <div className="flex gap-2 whitespace-nowrap">
                    <button className="px-5 py-2 font-medium text-sm hover:text-hover-dark transition-all duration-75">Đăng Ký</button>
                    <button className="flex items-center gap-1.5 px-5 py-2 outline-none border-2 font-semibold border-primary rounded-full text-white text-sm bg-primary hover:shadow-lg hover:border-transparent disabled:bg-gray-400/80 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:bg-hover">
                        Đăng Nhập <FontAwesomeIcon icon={faArrowRight} /> 
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
