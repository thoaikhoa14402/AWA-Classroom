import React from "react";
import { NavLink } from "react-router-dom";

import { ReactComponent as HomeIcon } from "~/assets/svg/home.svg";
import { ReactComponent as AcademyCap } from "~/assets/svg/academy-cap.svg";
import { ReactComponent as ScheduleIcon } from "~/assets/svg/schedule.svg";
import { ReactComponent as SettingIcon } from "~/assets/svg/setting.svg";

import classes from './Sidebar.module.css';

interface SidebarProps {
    open: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {

    const items = [{
        title: 'Cơ trở trí tuệ nhân tạo',
        color: 'bg-bluex'
    }, {
        title: 'Nhập môn lập trình OOP',
        color: 'bg-redx'
    }, {
        title: 'Kỹ thuật lập trình',
        color: 'bg-pinkx'
    }, {
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    },{
        title: 'Lập trình ứng dụng web nâng cao',
        color: 'bg-purplex'
    }]

    return (
        <aside
            className={`sticky inset-mbsize lg:inset-desksize sm:inset-desksize items-start flex flex-col border-r w-20 gap-2 whitespace-nowrap overflow-hidden px-4 py-5 border-r-gray-100 h-screen transition-all ease-in-out duration-300${
                props.open ? " !w-2/3 lg:!w-1/4 2xl:!w-1/5 md:!w-1/3 sm:!w-1/2 shadow-md " + classes['cshadow'] : ""
            }`}>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                className={`flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80`}
                to='/home'>
                <HomeIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5 text-ellipsis">Màn hình chính</div> : '' }
            </NavLink>
            <div className="relative flex flex-col gap-2">
                <NavLink
                    style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                    to='/classes'
                    className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                    <AcademyCap className="w-7 h-7" />{" "}
                    { props.open 
                        ? <div className="mt-0.5 text-ellipsis">Danh sách lớp học</div>
                        : '' 
                    }
                </NavLink>
                <div className="relative left-0 flex flex-col justify-start items-start rounded-lg max-h-60 overflow-y-auto bg-slate-50">
                    { props.open && items.map((el, _) => {
                        return <NavLink 
                                style={({ isActive }) => (isActive ? {backgroundColor: 'white', color: '#00A331', borderLeft: '4px solid #00A551', fontWeight: '500' } : {})}
                                to={`/classes/${_ + 1}`} key={_} title={el.title} className="flex border-l-4 border-l-transparent gap-3 items-center p-3 text-md hover:bg-slate-100 w-full">
                            <span className={`flex justify-center items-center w-8 h-8 text-white rounded-full ${el.color}`}>{el.title[0]}</span>
                            {(el.title.length > 22) ? `${el.title.substring(0, 22)}...` : el.title}
                        </NavLink>
                    }) }
                </div>
            </div>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/schedule'
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <ScheduleIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Lịch</div> : '' }
            </NavLink>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                to='/settings'
                type="button"
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <SettingIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Cài đặt</div> : '' }
            </NavLink>
        </aside>
    );
};

export default Sidebar;

