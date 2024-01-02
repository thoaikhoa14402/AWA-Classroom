import React, { useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";

import { ReactComponent as HomeIcon } from "~/assets/svg/home.svg";
import { ReactComponent as AcademyCap } from "~/assets/svg/academy-cap.svg";
import { ReactComponent as ScheduleIcon } from "~/assets/svg/schedule.svg";
import { ReactComponent as SettingIcon } from "~/assets/svg/setting.svg";

import classes from './Sidebar.module.css';
import { ClassType } from "~/store/reducers/classSlice";
import useAppSelector from "~/hooks/useAppSelector";

interface SidebarProps {
    open: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
    const classInfo = useAppSelector(state => state.classes);

    const items: ClassType[] = classInfo.classes;

    const generateRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const colors = useMemo(() => {
        return items.map(el => {
            return generateRandomColor();
        });
    }, [items]);

    const params = useParams();

    return (
        <aside
            className={`sticky inset-mbsize lg:inset-desksize sm:inset-desksize items-start flex flex-col border-r w-20 gap-2 whitespace-nowrap overflow-hidden px-4 py-5 border-r-gray-100 h-screen transition-all ease-in-out duration-300${
                props.open ? " !w-2/3 lg:!w-1/5 2xl:!w-1/5 md:!w-1/3 sm:!w-1/2 shadow-md " + classes['cshadow'] : ""
            }`}>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                className={`flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80`}
                to='/home'>
                <HomeIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5 text-ellipsis">Home screen</div> : '' }
            </NavLink>
            <div className="relative flex flex-col gap-2">
                <NavLink
                    style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                    to='/classes'
                    className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                    <AcademyCap className="w-7 h-7" />{" "}
                    { props.open 
                        ? <div className="mt-0.5 text-ellipsis">Classes</div>
                        : '' 
                    }
                </NavLink>
                {
                    props.open && items.length > 0 &&
                    <div className="relative left-0 flex flex-col justify-start items-start rounded-lg max-h-60 overflow-y-auto bg-slate-50">
                        { items.map((el, _) => {
                            return <NavLink 
                            style={(el.slug === params.classID ? {backgroundColor: 'white', color: '#00A331', borderLeft: '4px solid #00A551', fontWeight: '500'} : {})}
                            to={`/classes/feeds/${el.slug}`} key={el._id} title={el.cid} className="flex border-l-4 border-l-transparent gap-3 items-center p-3 text-md hover:bg-slate-100 w-full">
                                <span className={`flex justify-center items-center w-8 h-8 text-white rounded-full`} style={{ backgroundColor: colors[_] }} >{el.cid[0]}</span>
                                <div className="flex flex-col">
                                    <span className="text-md">{(el.cid.length > 22) ? `${el.cid.substring(0, 22)}...` : el.cid}</span>
                                    <span className="text-sm text-gray-700">{(el.name.length > 22) ? `${el.name.substring(0, 22)}...` : el.name}</span>
                                </div>
                            </NavLink>
                        }) }
                    </div>
                }
            </div>
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
                { props.open ? <div className="mt-0.5">Settings</div> : '' }
            </NavLink>
        </aside>
    );
};

export default Sidebar;

