import { faArrowRightToBracket, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, MenuProps, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NoClassMessage } from '~/components/Class';
import useAppSelector from '~/hooks/useAppSelector';
import { ClassType, addClass } from '~/store/reducers/classSlice';
import authStorage from '~/utils/auth.storage';
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg'; 
import ClassCard from '~/components/Class/ClassCard';
import useJoinModal from '~/hooks/useJoinModal';
import useAppDispatch from '~/hooks/useAppDispatch';
import useStudentIDModal from '~/hooks/useStudentIDModal';
import { setReviewLoading, setReviews } from '~/store/reducers/reviewSlice';

const ClassLayout: React.FC = () => {
    const params = useParams();
    const classID = params.classID;

    const classInfo = useAppSelector(state => state.classes);
    const reviewInfo = useAppSelector(state => state.reviews);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    const { setOpenJoinModal, ModalContext } = useJoinModal({
        handleCreate: (values) => {
            return new Promise((resolve, reject) => {
                axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/join-with-code/`, {
                    code: values.code,
                }, {
                    headers: {
                        Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                    }
                })
                .then(res => {
                    messageApi.success('Joined class successfully!', 2, () => {
                        dispatch(addClass(res.data.data));
                        navigate(`/classes/feeds/${res.data.data.slug}`);
                    });

                    resolve(res.data);
                })
                .catch(err => {
                    console.log(err);
                    messageApi.error('Joined class failed!');
                    reject(err);
                });
            });
        },
        handleCancel: async () => {}
    });
    
    const classes = classInfo.classes;
    const isLoading = classInfo.isLoading;
    const isReviewLoading = reviewInfo.isLoading;
    
    const items: MenuProps["items"] = [
        {
            key: "join-class",
            label: 'Join a class',
            icon: <FontAwesomeIcon icon={faArrowRightToBracket} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => { setOpenJoinModal(true); }
        }
    ];

    const [classDetail, setClassDetail] = useState<ClassType>();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(true);

    const [searchParams, _] = useSearchParams();

    const isInvite = !!(classID && /\w{15}/.test(classID) && searchParams.get('code'));
    const isJoined = useRef(!isInvite);

    const { setOpenStudentIDModal, ModalContext: StudentIDModalContext } = useStudentIDModal({
        handleCreate: (values) => {
            return new Promise((resolve, reject) => {
                axios.patch(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/student-id/${classID}`, {
                    studentID: values.studentID,
                }, {
                    headers: {
                        Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                    }
                })
                .then(res => {
                    messageApi.success('Updated student ID successfully!', 2, () => {
                        setClassDetail(prev => ({ ...prev!, studentID: values.studentID }));
                    });

                    resolve(res.data);
                })
                .catch(err => {
                    console.log(err);
                    if (err?.response?.data.message === 'Student ID is used') {
                        messageApi.error('Your student ID is used!');
                    }
                    else messageApi.error('Updated student ID failed!');
                    reject(err);
                });
            });
        },
        handleCancel: async () => {}
    });

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

            dispatch(setReviewLoading(true));
            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/review/${classID}`, {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                }
            })
            .then(res => {
                dispatch(setReviews(res.data.data.reviews));
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                dispatch(setReviewLoading(false));
            });
        } 
        else {
            setClassDetail(undefined);
            setIsDetailLoading(false);
            dispatch(setReviewLoading(false));
        }

        return () => {
            dispatch(setReviewLoading(false));
            setIsDetailLoading(false);
        }
    }, [classID, classInfo.classes, dispatch]);

    useEffect(() => {
        if (classDetail) {
            if (!isInvite && !classDetail.studentID) {
                setOpenStudentIDModal(true);
            }
        }
    }, [classDetail]);

    const location = useLocation();

    if (!classID && location.pathname !== '/classes') {
        return <Navigate to='/classes' replace />;
    }

    return (
        <>
            {contextHolder}
            {ModalContext}
            {
                (!isLoading && !isDetailLoading && !isReviewLoading)
                ? isInvite && !isJoined.current ? <Outlet /> 
                : isInvite && isJoined ? 'You are joined'                    
                    : classes.length 
                    ? 
                    <>
                        {StudentIDModalContext}
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
                                        <NavLink to={`/classes/reviews/${classID}`} style={({ isActive }) => (isActive) ? { color: '#00A551', border: '4px solid transparent', borderBottomColor: '#00A551' } : { border: '4px solid transparent', borderBottomColor: 'transparent' }} className='!shadow-none hover:!text-hover-dark !font-medium !transition-all !duration-150 p-1.5'>Review Requests</NavLink>
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