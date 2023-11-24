import React from "react";
import { NavLink } from "react-router-dom";

import { ReactComponent as HomeIcon } from "~/assets/svg/home.svg";
import { ReactComponent as AcademyCap } from "~/assets/svg/academy-cap.svg";
import { ReactComponent as ScheduleIcon } from "~/assets/svg/schedule.svg";
import { ReactComponent as SettingIcon } from "~/assets/svg/setting.svg";
import { ReactComponent as StudentIcon } from "~/assets/svg/student.svg";
import {ReactComponent as ClassroomIcon} from '~/assets/svg/classroom.svg';


import classes from './Sidebar.module.css';

interface SidebarProps {
    open: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {

    return (
        <aside
            className={`sticky inset-mbsize lg:inset-desksize sm:inset-desksize items-start flex flex-col border-r w-20 gap-2 whitespace-nowrap overflow-hidden px-4 py-5 border-r-gray-100 h-screen transition-all ease-in-out duration-300${
                props.open ? " !w-2/3 lg:!w-1/4 2xl:!w-1/5 md:!w-1/3 sm:!w-1/2 shadow-md " + classes['cshadow'] : ""
            }`}>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                className={`flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80`}
                to='/dashboard'>
                <HomeIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5 text-ellipsis">Main Dashboard</div> : '' }
            </NavLink>
            
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/classroom-management'
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <ClassroomIcon className="w-7 h-7" />{" "}
                { props.open 
                    ? <div className="mt-0.5 text-ellipsis">Classroom Management</div>
                    : '' 
                }
            </NavLink>

            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/lecturer-management'
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <AcademyCap className="w-7 h-7" />{" "}
                { props.open 
                    ? <div className="mt-0.5 text-ellipsis">Lecturer Management</div>
                    : '' 
                }
            </NavLink>

            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/student-management'
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <StudentIcon className="w-7 h-7" />{" "}
                { props.open 
                    ? <div className="mt-0.5 text-ellipsis">Student Management</div>
                    : '' 
                }
            </NavLink>

            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/schedule'
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <ScheduleIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Calendar</div> : '' }
            </NavLink>

            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/settings'
                type="button"
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <SettingIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Setting</div> : '' }
            </NavLink>
        </aside>
    );
};

export default Sidebar;

