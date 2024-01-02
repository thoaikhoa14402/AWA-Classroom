import React, { FormEvent, ReactNode, useCallback, useMemo, useRef } from "react";
import { NavLink, createSearchParams, useNavigate } from "react-router-dom";

import {  faArrowRight, faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Menu, Dropdown, MenuProps, Divider } from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";

import useAppSelector from "~/hooks/useAppSelector";
import useRandomColor from "~/hooks/useRandomColor";

import classes from './Navbar.module.css';
import authStorage from "~/utils/auth.storage";
import { clearUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";

interface NavbarProps {
    toggleSidebar: (option?: string | boolean) => void
};

const Navbar: React.FC<NavbarProps> = (props) => {
    const isLogin = authStorage.isLogin();

    const dispatch = useAppDispatch();

    const color = useRandomColor();
    const profile = useAppSelector(state => state.user.profile);

    const navigate = useNavigate();
    const searchRef = useRef<HTMLInputElement>(null);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (searchRef.current?.value) {
            navigate({
                pathname: '/search',
                search: createSearchParams({
                    q: searchRef.current.value
                }).toString()
            });
        }
    }

    const items: MenuProps['items'] = useMemo(() => [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5',
            onClick: () => { navigate('/user/profile'); props.toggleSidebar(false); }
        },
        {
            key: 'reset-password',
            label: 'Reset password',
            icon: <KeyOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5',
            onClick: () => { navigate('/user/reset-password'); props.toggleSidebar(false); }
        },
        {
            key: 'divider',
            label: <Divider className='!m-1' />,
            disabled: true,
            className: '!p-0'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5',
            onClick: () => {
                dispatch(clearUserProfile());
                navigate('/auth/login', { replace: true });
            }
        }
    ], [navigate, props, dispatch]);

    const menus = useCallback((_:ReactNode) => (
        <Menu className="!shadow-md border border-slate-100 !w-full !rounded-md" items={items} />
    ), [items]);

    return (
        <nav className="bg-white w-screen flex justify-center shadow-sm px-4 sticky top-0 z-10">
            <div
                className={ 
                    "max-w-screen-2xl w-screen flex flex-col sm:flex-row justify-between items-center gap-3 lg:gap-0"
                }>
                <div className="flex items-center gap-3 whitespace-nowrap">
                    <button type="button" title="Menu" onClick={() => props.toggleSidebar()} className="rounded-full px-3 py-3 flex justify-center items-center hover:bg-slate-100 transition-all duration-300"><FontAwesomeIcon icon={faBars} width={16} color="grey" /></button>
                    {/* <img src="rocket.png" alt="Logo" className="w-8 h-8 mr-2" /> */}
                    <NavLink to="/" className="text-primary text-xl font-medium py-5">
                        AWA Classroom
                    </NavLink>
                </div>
                <form onSubmit={handleSearch} autoComplete="off" className="w-1/2 bg-transparent flex justify-center items-center px-0.5 shadow-sm shadow-slate-200 overflow-hidden rounded-full" action='/' method='GET'>
                    <input ref={searchRef} required type="search" name="q" className="w-full px-3.5 py-2.5 text-sm outline-none" placeholder="Find related keywords, ..." />
                    <button type="submit" className={`${classes['submit-btn']} bg-primary flex items-center p-3 border-none outline-none rounded-full font-bold`} title="Search">
                        <FontAwesomeIcon icon={faSearch} color="white" size="sm" />
                    </button>
                </form>
                { 
                    isLogin ? 
                    <Dropdown menu={{items}} trigger={['click']} getPopupContainer={trigger => trigger.parentElement!}
                        dropdownRender={menus}> 
                        <button type="button" className="flex justify-center items-center gap-3.5 hover:bg-gray-100 px-5 py-2 rounded-md">
                            <span className="flex flex-col items-end lg:flex md:hidden sm:hidden">
                                <span className="font-medium text-right">{profile?.username}</span>
                                <small className="capitalize">{profile?.role}</small>
                            </span>
                            <span className="flex justify-center items-center w-10 h-10 rounded-full font-semibold text-white overflow-hidden" style={{
                                backgroundColor: color,
                            }}>
                                { profile?.avatar ? <img className="w-full" src={profile?.avatar} alt="avatar" /> : profile?.username[0] }
                            </span>
                        </button> 
                    </Dropdown>
                    : 
                    <div className="flex gap-2 whitespace-nowrap">
                        <NavLink to='/auth/register' className="px-5 py-2.5 font-medium text-sm hover:text-hover-dark transition-all duration-75">Register</NavLink>
                        <NavLink to='/auth/login' className="flex items-center gap-1.5 px-5 py-2.5 outline-none border-2 font-semibold border-primary rounded-full text-white text-sm bg-primary hover:shadow-lg hover:border-transparent disabled:bg-gray-400/80 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:bg-hover">
                            Login <FontAwesomeIcon icon={faArrowRight} /> 
                        </NavLink>
                    </div> 
                }
            </div>
        </nav>
    );
};

export default Navbar;
