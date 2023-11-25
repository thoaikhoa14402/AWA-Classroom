import { faArrowRightToBracket, faCheck, faClone, faEllipsis, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, MenuProps, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useParams, useSearchParams } from 'react-router-dom';
import { NoClassMessage } from '~/components/Class';
import useAppSelector from '~/hooks/useAppSelector';
import { ClassType } from '~/store/reducers/classSlice';
import authStorage from '~/utils/auth.storage';
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg'; 
import ClassCard from '~/components/Class/ClassCard';

const ClassLayout: React.FC = () => {
    const params = useParams();
    const classID = params.classID;

    const classInfo = useAppSelector(state => state.classes);

    
    const classes = classInfo.classes;
    const isLoading = classInfo.isLoading;
    
    const items: MenuProps["items"] = [
        {
            key: "join-class",
            label: 'Join a class',
            icon: <FontAwesomeIcon icon={faArrowRightToBracket} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
        }
    ];

    const [classDetail, setClassDetail] = useState<ClassType>();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(true);

    const [searchParams, _] = useSearchParams();

    const isInvite = !!(classID && /\w{15}/.test(classID) && searchParams.get('code'));
    const isJoined = useRef(!isInvite);

    useEffect(() => {
        if (classID) {
            setIsDetailLoading(true);
            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/${classID}`, {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                }
            })
            .then(res => {
                isJoined.current = res.data.data.slug === classID;
                setClassDetail(res.data.data);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setIsDetailLoading(false);
            });
        } 
        else {
            setClassDetail(undefined);
            setIsDetailLoading(false);
        }
    }, [classID, classInfo.classes]);

    return (
        <>
            {
                (!isLoading && !isDetailLoading)
                ? isInvite && !isJoined.current ? <Outlet /> 
                : isInvite && isJoined ? 'You are joined'                    
                    : classes.length 
                    ? 
                    <>
                        <div className='flex justify-end items-center h-13 px-3'>
                            { classDetail && classID ? 
                                <>
                                    <div className='mr-auto flex flex-col'>
                                        <span className='text-gray-600 text-lg font-medium'>{ classDetail.cid }</span>
                                        <span className='text-gray-600 text-sm'>{ classDetail.name }</span>
                                    </div>
                                    <div className='mx-auto flex gap-8'>
                                        <NavLink to={`/classes/feeds/${classID}`} style={({ isActive }) => (isActive) ? { color: '#00A551', border: '4px solid transparent', borderBottomColor: '#00A551' } : { border: '4px solid transparent', borderBottomColor: 'transparent' }} className='!shadow-none hover:!text-hover-dark !font-medium !transition-all !duration-150 p-1.5'>News Feed</NavLink>
                                        <NavLink to={`/classes/works/${classID}`} style={({ isActive }) => (isActive) ? { color: '#00A551', border: '4px solid transparent', borderBottomColor: '#00A551' } : { border: '4px solid transparent', borderBottomColor: 'transparent' }} className='!shadow-none hover:!text-hover-dark !font-medium !transition-all !duration-150 p-1.5'>Classwork</NavLink>
                                        <NavLink to={`/classes/members/${classID}`} style={({ isActive }) => (isActive) ? { color: '#00A551', border: '4px solid transparent', borderBottomColor: '#00A551' } : { border: '4px solid transparent', borderBottomColor: 'transparent' }} className='!shadow-none hover:!text-hover-dark !font-medium !transition-all !duration-150 p-1.5'>Members</NavLink>
                                        <NavLink to={`/classes/grades/${classID}`} style={({ isActive }) => (isActive) ? { color: '#00A551', border: '4px solid transparent', borderBottomColor: '#00A551' } : { border: '4px solid transparent', borderBottomColor: 'transparent' }} className='!shadow-none hover:!text-hover-dark !font-medium !transition-all !duration-150 p-1.5'>Grade</NavLink>
                                    </div>
                                </>
                                : ''
                            }
                            <Dropdown className='ml-auto' menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                                <Button shape='circle' className='!w-10 !h-10'>
                                    <FontAwesomeIcon icon={faEllipsis} size='lg' />
                                </Button>
                            </Dropdown>
                        </div>
                        { !classDetail && !classID ?
                            <>
                                <h1 className='text-2xl font-medium mb-6 mt-0'>All Classes</h1>
                                <div className={`flex flex-wrap gap-10 xl:gap-4 xl:gap-y-4`}>
                                    { classes.map((el, _) => (<ClassCard key={el._id} details={el} />)) }
                                </div>
                            </>
                            : 
                            classDetail && classID ? 
                            <>
                                <div className='flex w-full my-5'>
                                    <div className='relative w-full'>
                                        {/* <div className='absolute left-0 bottom-0 !z-1 m-5 !text-white flex flex-col gap-1'>
                                            <div className='font-medium'>Class code:</div>
                                            <Typography.Text 
                                                className='!text-white font-semibold !text-xl'
                                                copyable={{
                                                    text: classDetail.inviteCode,
                                                    tooltips: ['Copy', 'Copied!'],
                                                    icon: [<FontAwesomeIcon key={classDetail.inviteCode} icon={faClone} className='text-gray-300 hover:text-white ml-1' />, <FontAwesomeIcon key={`copied_${classDetail.inviteCode}`} className='ml-1' icon={faCheck} color='lightgreen' />]
                                                }}>{ classDetail.inviteCode }</Typography.Text>
                                        </div> */}
                                        <img className='w-full rounded-xl' alt={`banner_${classDetail.name}`} src={classDetail.banner} />
                                    </div>
                                </div>
                                <Outlet context={[classDetail]} />
                            </>
                            : (!classDetail && classID) ? 'Class not founded' : null
                        }
                    </>
                    : <NoClassMessage />
                : <div className='flex h-full w-full justify-center items-center pb-28'>
                    <LoadingIndicator />
                </div>
            }  
        </>
    );
};

export default ClassLayout;