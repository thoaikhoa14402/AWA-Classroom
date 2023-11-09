import React from "react";
import { NavLink } from "react-router-dom";

import { ReactComponent as HomeIcon } from "~/assets/svg/home.svg";
import { ReactComponent as AcademyCap } from "~/assets/svg/academy-cap.svg";
import { ReactComponent as ScheduleIcon } from "~/assets/svg/schedule.svg";
import { ReactComponent as SettingIcon } from "~/assets/svg/setting.svg";

import './Sidebar.css';

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
            className={`sticky inset-mbsize lg:inset-desksize items-start sm:inset-desksize flex flex-col border-r w-20 gap-2 whitespace-nowrap overflow-hidden px-4 py-5 border-r-gray-100 h-screen transition-all ease-in-out duration-300${
                props.open ? " !w-2/3 lg:!w-1/4 2xl:!w-1/5 md:!w-1/3 sm:!w-1/2" : ""
            }`}>
            <NavLink
                style={({ isActive }) => (isActive ? {backgroundColor: '#00A551', borderRadius: '0.5rem', color: 'white', fontWeight: '500'} : {})}
                className={`flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80`}
                to='/'>
                <HomeIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5 text-ellipsis">Màn hình chính</div> : '' }
            </NavLink>
            <div className="relative flex flex-col gap-2">
                <button
                    type="button"
                    className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                    <AcademyCap className="w-7 h-7" />{" "}
                    { props.open 
                        ? <div className="mt-0.5 text-ellipsis">Danh sách lớp học</div>
                        : '' 
                    }
                </button>
                <div className="relative left-0 flex flex-col justify-start items-start rounded-lg max-h-60 overflow-y-auto bg-slate-100">
                    { props.open && items.map((el, _) => {
                        return <button key={_} title={el.title} className="flex gap-3 items-center p-3 text-md hover:bg-slate-200 w-full">
                            <span className={`flex justify-center items-center w-8 h-8 text-white rounded-full ${el.color}`}>{el.title[0]}</span>
                            {(el.title.length > 22) ? `${el.title.substring(0, 22)}...` : el.title}
                        </button>
                    }) }
                </div>
            </div>
            <button
                type="button"
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <ScheduleIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Lịch</div> : '' }
            </button>
            <button
                type="button"
                className="flex gap-6 items-start p-3 text-md hover:bg-slate-100 hover:rounded-lg w-80">
                <SettingIcon className="w-7 h-7" />{" "}
                { props.open ? <div className="mt-0.5">Cài đặt</div> : '' }
            </button>
        </aside>
    );
};

export default Sidebar;

