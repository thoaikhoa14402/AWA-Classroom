import React, { ReactNode, useCallback, useMemo } from 'react';
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import { ReactComponent as AcademyCap } from "~/assets/svg/academy-cap.svg";
import { ReactComponent as ScheduleIcon } from "~/assets/svg/schedule.svg";
import { ReactComponent as WifiIcon } from "~/assets/svg/wifi.svg";
import { ReactComponent as BookOpenIcon } from "~/assets/svg/book-open.svg";
import { ReactComponent as ChartIcon } from "~/assets/svg/chart.svg";
import { ReactComponent as PuzzleIcon } from "~/assets/svg/puzzle.svg";
import { ReactComponent as ClockIcon } from "~/assets/svg/clock.svg";
import { ReactComponent as DiscussIcon } from "~/assets/svg/discuss.svg";
import landingPicture from '~/assets/images/landing.jpeg';
import whyPicture from '~/assets/images/why.png';
import { NavLink, useNavigate } from 'react-router-dom';
import authStorage from '~/utils/auth.storage';
import { Divider, Dropdown, Menu, MenuProps } from 'antd';
import useRandomColor from '~/hooks/useRandomColor';
import useAppSelector from '~/hooks/useAppSelector';
import { clearUserProfile } from '~/store/reducers/userSlice';
import useAppDispatch from '~/hooks/useAppDispatch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright } from '@fortawesome/free-solid-svg-icons';

const LandingPage: React.FC = () => {
    const isLogin = authStorage.isLogin();

    const dispatch = useAppDispatch();

    const color = useRandomColor();
    const profile = useAppSelector(state => state.user.profile)!;

    const navigate = useNavigate();

    const items: MenuProps['items'] = useMemo(() => [
        {
            key: 'profile',
            label: 'Cá nhân',
            icon: <UserOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5',
            onClick: () => { navigate('/user/profile'); }
        },
        {
            key: 'reset-password',
            label: 'Đổi mật khẩu',
            icon: <KeyOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5'
        },
        {
            key: 'divider',
            label: <Divider className='!m-1' />,
            disabled: true,
            className: '!p-0 !m-0'
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined className="!text-lg" />,
            className: '!px-4 !py-3 !text-md !gap-1.5',
            onClick: () => {
                dispatch(clearUserProfile());
                navigate('/auth/login', { replace: true });
            }
        }
    ], [navigate, dispatch]);

    const menus = useCallback((_:ReactNode) => (
        <Menu className="!shadow-md border border-slate-100 !w-full !rounded-md" items={items} />
    ), [items]);

    return <>
        <div className='2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto flex justify-between shadow-sm w-full items-center px-9 sticky top-0 bg-white'>
            <div className='gap-7 text-sm hidden lg:flex'>
                <NavLink to={'#gioithieu'} className={'hover:text-hover-dark transition-all duration-150 py-6'}>Giới thiệu</NavLink>
                <NavLink to={'#tinhnang'} className={'hover:text-hover-dark transition-all duration-150 py-6'}>Tính năng</NavLink>
                <NavLink to={'#lydo'} className={'hover:text-hover-dark transition-all duration-150 py-6'}>Lý do</NavLink>
                <NavLink to={'#lienhe'} className={'hover:text-hover-dark transition-all duration-150 py-6'}>Liên hệ</NavLink>
            </div>
            <h1 className='text-primary font-semibold text-xl py-5'>AWA Classroom</h1>
            { 
                isLogin ? 
                <Dropdown menu={{items}} trigger={['click']} getPopupContainer={trigger => trigger.parentElement!}
                    dropdownRender={menus}> 
                    <button type="button" className="flex justify-center items-center gap-3.5 hover:bg-gray-100 px-5 py-2 rounded-md">
                        <span className="hidden flex-col items-end lg:flex md:flex">
                            <span className="font-medium text-right">{profile.username}</span>
                            <small>{profile.role}</small>
                        </span>
                        <span className="flex justify-center items-center w-10 h-10 rounded-full font-semibold text-white overflow-hidden" style={{
                            backgroundColor: color,
                        }}>
                            { profile.avatar ? <img className="w-full" src={profile.avatar} alt="avatar" /> : profile.username[0] }
                        </span>
                    </button> 
                </Dropdown>
                : 
                <div className="flex gap-2 whitespace-nowrap">
                    <NavLink to='/auth/login' className="px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 transition-all duration-300">Đăng Nhập</NavLink>
                    <NavLink to='/auth/register' className="flex items-center gap-1.5 px-4 py-2.5 outline-none border-2 font-semibold border-primary rounded-lg text-white text-sm bg-primary hover:shadow-lg hover:border-transparent disabled:bg-gray-400/80 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 hover:bg-hover">
                        Đăng Ký 
                    </NavLink>
                </div>  
            }
        </div>
        <div className="2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto border-x border-gray-100 min-h-screen">
            <div className='flex justify-center px-12 py-2 sm:pb-16 md:pb-32 items-center border-b border-gray-100 min-h-screen'>
                <div className='flex flex-col items-start lg:w-1/3 sm:w-full gap-5'>
                    <b className='font-bold text-primary text-3xl'>AWA Classroom</b>
                    <h1 className='text-2xl font-bold'>Một cách hiệu quả để quản lý lớp học của bạn</h1>
                    <p>AWA Classroom giúp các nhà giáo dục tạo ra trải nghiệm học tập hấp dẫn mà họ có thể cá nhân hóa, quản lý và đo lường. Hỗ trợ tổ chức của bạn bằng các công cụ cộng tác đơn giản, an toàn hơn.</p>
                    <NavLink to={'/auth/register'} className='bg-primary text-white font-semibold px-8 py-4 rounded-xl text-md hover:bg-hover transition-all duration-150'>Tham gia ngay</NavLink>
                </div>
                <div className='w-1/2 rounded-3xl overflow-hidden md:block hidden'>
                    <img src={landingPicture} className='w-full' alt='landing-page' />
                </div>
            </div>
            <div className='flex flex-col items-center py-12 bg-slate-50 gap-5 text-center'>
                <h1 className='text-3xl font-medium text-gray-600'>Theo dõi lịch trình, học tập theo nhóm, kết nối - trao đổi</h1>
                <div className='flex justify-center w-full gap-20 mt-8 flex-wrap'>
                    <div className='flex flex-col justify-center items-center gap-8 p-10 text-center bg-white w-60 h-60 rounded-3xl border border-primary border-dashed'>
                        <div className='bg-primary p-4 rounded-full'>
                            <ScheduleIcon className="w-10 text-white" strokeWidth={1.5} />
                        </div>
                        <div className='font-medium'>
                            Theo dõi lịch học linh động
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-8 p-10 text-center bg-white w-60 h-60 rounded-3xl border border-primary border-dashed'>
                        <div className='bg-primary p-4 rounded-full'>
                            <AcademyCap className="w-10 text-white" strokeWidth={1.5} />
                        </div>
                        <div className='font-medium'>
                            Môi trường làm việc nhóm
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-center gap-8 p-10 text-center bg-white w-60 h-60 rounded-3xl border border-primary border-dashed'>
                        <div className='bg-primary p-4 rounded-full'>
                            <DiscussIcon className="w-10 text-white" strokeWidth={1.5} />
                        </div>
                        <div className='font-medium'>
                            Kết nối - trao đổi nhanh chóng
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-col items-center py-12 pb-16 gap-5 text-center'>
                <h1 className='text-3xl font-medium text-gray-600'>Tại sao chọn AWA Classroom</h1>
                <div className='flex justify-center w-full mt-8 flex-wrap'>
                    <div className='flex flex-col justify-center items-end gap-20 px-8 text-center bg-white w-1/3 rounded-3xl'>
                        <div className='flex flex-col justify-center items-end gap-4 text-right bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <WifiIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Tiện Lợi và Linh Hoạt:
                            </div>
                            <p>Truy cập học mọi lúc, mọi nơi, giúp quản lý thời gian hiệu quả.</p>
                        </div>
                        <div className='flex flex-col justify-center items-end gap-4 text-right bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <BookOpenIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Truy Cập Dễ Dàng đến Nội Dung
                            </div>
                            <p>Nhanh chóng tiếp cận nội dung học với bài giảng, video và tài liệu trực tuyến.</p>
                        </div>
                        <div className='flex flex-col justify-center items-end gap-4 text-right bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <DiscussIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Giao Tiếp Hiệu Quả và Phản Hồi Nhanh Chóng
                            </div>
                            <p>Tương tác dễ dàng với giáo viên, nhận phản hồi nhanh chóng.</p>
                        </div>
                    </div>
                    <div className='flex justify-center items-center gap-8 text-center bg-white w-1/3 rounded-3xl'>
                        <img src={whyPicture} alt='why-choosen' />
                    </div>
                    <div className='flex flex-col justify-center items-start gap-20 px-8 text-center bg-white w-1/3 rounded-3xl'>
                        <div className='flex flex-col justify-center items-start gap-4 text-left bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <ChartIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Quản Lý Tiến Trình Học Tập
                            </div>
                            <p>Theo dõi tiến trình học tập và đánh giá hiệu suất học viên.</p>
                        </div>
                        <div className='flex flex-col justify-center items-start gap-4 text-left bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <PuzzleIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Tính Tương Tác và Hợp Tác
                            </div>
                            <p>Tạo môi trường học tập đa chiều, khuyến khích tương tác và hợp tác.</p>
                        </div>
                        <div className='flex flex-col justify-center items-start gap-4 text-left bg-white rounded-3xl'>
                            <div className='bg-primary p-4 rounded-full'>
                                <ClockIcon className="w-10 text-white" strokeWidth={1.5} />
                            </div>
                            <div className='font-medium'>
                                Hiệu Quả và Tiết Kiệm Thời Gian
                            </div>
                            <p>Tiết kiệm thời gian với quản lý lớp học hiệu quả và truy cập nhanh chóng vào tài nguyên.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer className="bg-primary text-white p-10">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center items-center">
                    <div className="w-full md:w-1/2 lg:w-1/3 pr-20">
                        <h2 className="text-lg font-bold mb-2">AWA Classroom</h2>
                        <p className="text-sm font-medium">Nền tảng online classroom giúp học viên và giảng viên kết nối và học tập hiệu quả.</p>
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/3">
                        <h2 className="text-lg font-bold mb-2">Đường dẫn</h2>
                        <ul className="list-none p-0">
                            <li><NavLink to="/auth/login" className="text-sm font-medium">Đăng nhập</NavLink></li>
                            <li><NavLink to="/auth/register" className="text-sm font-medium">Đăng ký</NavLink></li>
                            <li><NavLink to="/home" className="text-sm font-medium">Trang chủ</NavLink></li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/2 lg:w-1/3">
                        <h2 className="text-lg font-bold mb-2">Học viên và Giảng viên</h2>
                        <ul className="list-none p-0">
                            <li><NavLink to="#" className="text-sm font-medium">Học viên</NavLink></li>
                            <li><NavLink to="#" className="text-sm font-medium">Giảng viên</NavLink></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
        <div className="2xl:max-w-screen-2xl 2xl:w-screen 2xl:m-auto text-center p-4 font-semibold bg-primary text-white text-sm">
            2023 <FontAwesomeIcon icon={faCopyright} /> AWA Copyright
        </div>
    </>
};

export default LandingPage;