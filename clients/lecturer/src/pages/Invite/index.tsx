import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useAppSelector from '~/hooks/useAppSelector';
import authStorage from '~/utils/auth.storage';
import useAppDispatch from '~/hooks/useAppDispatch';
import { addClass } from '~/store/reducers/classSlice';

const Invite: React.FC = () => {

    const user = useAppSelector(state => state.user);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    const params = useParams();
    const [searchParams, _] = useSearchParams();

    const isInvite = params.classID && /\w{15}/.test(params.classID) && searchParams.get('code');

    if (!isInvite)
        return <Navigate to='/home' replace />

    const handleJoin = () => {
        axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/join/${params.classID}`, {
            code: searchParams.get('code'),
            classID: params.classID
        }, {
            headers: {
                Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
            }
        })
        .then(res => {
            console.log(res.data);

            messageApi.success('Joined class successfully!', 2, () => {
                dispatch(addClass(res.data.data));
                navigate(`/classes/feeds/${params.classID}`);
            });
        })
        .catch(err => {
            console.log(err);
            messageApi.error('Joined class failed!');
        });
    };

    return (
        <>
            {contextHolder}
            <div className="flex flex-col items-center justify-center h-full pb-28">
                <h1 className='text-3xl font-semibold text-primary mb-10'>AWA Classroom</h1>
                <p className="font-semibold mb-6 text-2xl">
                    You're invited to join a class!
                </p>
                <p className="text-gray-600 mb-8 text-center text-base">
                    Welcome <span className='font-semibold text-primary'>{user.profile?.username}</span>! You're taking a class as a student.
                </p>
                <Button size="large" shape="round" className="!text-primary !border-primary" onClick={handleJoin}>JOIN NOW</Button>
            </div>
        </>
    );
};

export default Invite;