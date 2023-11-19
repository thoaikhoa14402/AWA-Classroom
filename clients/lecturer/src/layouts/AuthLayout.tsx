import React from 'react';
import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';
import lecturerImg from '~/assets/images/lecturer.png';


const AuthLayout: React.FC = () => {
    return <Flex>
    <div className = 'w-1/2'>
        <img src = {lecturerImg} className = "w-full h-full" alt="learning-bg" />
    </div>
    <div className = "w-1/2 flex justify-center items-center h-screen">
        <Outlet />
    </div>
    </Flex>
}

export default AuthLayout;