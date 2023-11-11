import React from 'react';
import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';
import eLearningImg from '~/assets/images/e-learning.jpg'


const AuthLayout: React.FC = () => {
    return <Flex>
    <div className = 'w-1/2'>
        <img src = {eLearningImg} className = "w-full h-full" alt="learning-bg" />
    </div>
    <div className = "w-1/2 flex justify-center items-center h-screen">
        <Outlet />
    </div>
    </Flex>
}

export default AuthLayout;