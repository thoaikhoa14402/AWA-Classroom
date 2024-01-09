import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Editor } from '@tinymce/tinymce-react';
import { Button, Input, Tag, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext, useParams } from 'react-router-dom';
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg'; 
import useAppDispatch from '~/hooks/useAppDispatch';

import useAppSelector from '~/hooks/useAppSelector';
import { ClassType } from '~/store/reducers/classSlice';
import { ICommentType, setComments } from '~/store/reducers/reviewSlice';
import authStorage from '~/utils/auth.storage';
import { socket } from '~/utils/socket';

import '../../components/Reviews/editor.css';

const ReviewDetails: React.FC = () => {

    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    // const review = useAppSelector(state => state.reviews);
    const [details] = useOutletContext<[ClassType]>();
    const userInfo = useAppSelector(state => state.user.profile);

    const [finalGrade, setFinalGrade] = React.useState<number | string>('');
    
    const { classID, reviewID } = useParams();
    const [reviewDetails, setReviewDetails] = useState<any>('');
    const [isLoading, setIsLoading] = useState(true);

    const editorRef = useRef<any>(null);

    useEffect(() => {

        socket.emit('review:join', {
            reviewID: reviewID,
        });

        socket.on('review:comment', (data: any) => {
            setReviewDetails((prev: any) => {
                return {
                    ...prev,
                    comments: data.comments,
                };
            });
        });

        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/review/view/${reviewID}`, {
            headers: {
                Authorization: (authStorage.isLogin()) ? `Bearer ${authStorage.getAccessToken()}` : '', 
            },
        }).then(res => {
            setReviewDetails(res.data.data.review);
            setFinalGrade(res.data.data.review.expected);
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const handleComment = () => {
        if (editorRef.current.getContent().trim() === '') {
            return;
        }
        
        axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/review/comment/${reviewID}`, {
            content: editorRef.current.getContent(),
        }, {
            headers: {
                Authorization: (authStorage.isLogin()) ? `Bearer ${authStorage.getAccessToken()}` : '', 
            },
        }).then(res => {
            editorRef.current.setContent('');

            dispatch(setComments(res.data.data));
            setReviewDetails((prev: any) => {
                return {
                    ...prev,
                    comments: res.data.data,
                };
            });
        }).catch(err => {
            console.log(err);
            messageApi.error('Something went wrong !');
        });
    }

    const validateFinalGrade = (e: any) => {
        const value = e.target.value;
        
        if (!isNaN(parseInt(value))) {
            const grade = parseInt(value);

            if (grade > 10 || grade < 0) {
                setFinalGrade(10);
            } 
            else {
                setFinalGrade(grade);
            }
        }
        else setFinalGrade('');
    }

    const closeWithFinalGrade = () => {
        if (isNaN(parseInt(String(finalGrade)))) {
            return messageApi.error('Please enter a valid grade !');
        }

        axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/review/close/${reviewID}`, {
            finalGrade: finalGrade,
        }, {
            headers: {
                Authorization: (authStorage.isLogin()) ? `Bearer ${authStorage.getAccessToken()}` : '', 
            },
        }).then(res => {
            messageApi.success('Close review request successfully !');
            setReviewDetails((prev: any) => {
                return {
                    ...prev,
                    finalGrade: res.data.data.review.finalGrade,
                    opened: false
                };
            });
        }).catch(err => {
            console.log(err);
            messageApi.error('Something went wrong !');
        });
    }

    if (!isLoading && !reviewDetails) 
        return <Navigate to={`/classes/review/${classID}`} replace />

    return (isLoading) ? <LoadingIndicator className='!mt-24' /> : (
        <>
            {contextHolder}
            <div className='p-3 flex gap-12 items-start justify-center'>
                <div className='flex flex-col gap-8'>
                    <div className='flex gap-6'>
                        <div className='flex flex-col items-end gap-2 max-w-[180px]'>
                            <div className='rounded-full overflow-hidden border'>
                                <img width='50px' src={reviewDetails.joinedInfo.user?.avatar} alt='avatar' />
                            </div>
                            <div className='flex flex-col items-end'>
                                <div className='font-medium'>{reviewDetails.joinedInfo.user?.username}</div>
                                <small className='capitalize'>{reviewDetails.joinedInfo.studentID}</small>
                            </div>
                        </div>  
                        <div className='flex flex-col border-primary rounded-md border flex-1 overflow-hidden'>
                            <div className='bg-primary text-white p-3.5 px-4 text-sm font-medium'>
                                Review request for <b>"{ reviewDetails.composition }"</b> was opened on { reviewDetails.formatedDate }
                            </div>
                            <div className='text-sm p-4' style={{
                                minHeight: 154,
                                width: 750,
                            }} dangerouslySetInnerHTML={{__html: reviewDetails.reason}}></div>
                        </div>
                    </div>
                    {
                        reviewDetails.comments.map((el: ICommentType, index: number) => (
                            <div key={el._id} className='flex gap-6 flex-1 flex-row'>
                                <div className='flex flex-col items-end gap-2 max-w-[180px]'>
                                    <div className='rounded-full overflow-hidden border'>
                                        <img width='50px' src={el.sender?.avatar} alt='avatar' />
                                    </div>
                                    <div className='flex flex-col items-end'>
                                        <div className='font-medium'>{el.sender.username}</div>
                                        <small className='capitalize'>{el.sender._id === userInfo?._id ? el.sender.role : reviewDetails.joinedInfo.studentID}</small>
                                    </div>
                                </div>  
                                <div className={`flex flex-col rounded-md border flex-1 overflow-hidden ${ el.sender._id === userInfo?._id ? 'border-primary' : 'border-blue-600' }`}>
                                    <div className={`${ el.sender._id === userInfo?._id ? 'text-primary' : 'text-blue-500' } p-3.5 px-4 text-sm font-medium`}>
                                        { el.sender._id === userInfo?._id ? 'You' : reviewDetails.joinedInfo.studentID } has comment on a review request for <b>"{ reviewDetails.composition }"</b> on { el.formatedDate }
                                    </div>
                                    <div className='text-sm p-4' style={{
                                        minHeight: 121,
                                        width: 750,
                                    }} dangerouslySetInnerHTML={{__html: el.content}}></div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className='sticky inset-mbsize lg:inset-desksize sm:inset-desksize py-4'>
                    <table className='border-none border-collapse w-full'>
                        <tbody>
                            <tr>
                                <td className='px-4 py-3.5 border bg-gray-50 text-primary font-medium'>Composition</td>
                                <td className='px-4 py-3.5 border text-center font-medium text-lg'>{ reviewDetails.composition }</td>
                            </tr>
                            <tr>
                                <td className='px-4 py-3.5 border bg-gray-50 text-primary font-medium'>Grade</td>
                                <td className='px-4 py-3.5 border text-center font-medium text-lg'>{ reviewDetails.grade }</td>
                            </tr>
                            <tr>
                                <td className='px-4 py-3.5 border bg-gray-50 text-primary font-medium'>Expected Grade</td>
                                <td className='px-4 py-3.5 border text-center font-medium text-lg'>{ reviewDetails.expected }</td>
                            </tr>
                            {
                                (reviewDetails.opened === false) ?
                                <tr>
                                    <td className='px-4 py-3.5 border bg-primary text-white font-medium'>Final Grade</td>
                                    <td className='px-4 py-3.5 border text-primary text-center font-medium text-xl'>{ reviewDetails.finalGrade }</td>
                                </tr>
                                : null
                            }
                            {
                                reviewDetails.opened === true ?
                                <tr>
                                    <td className='px-4 py-3.5 border bg-primary text-white font-medium'>Final Grade</td>
                                    <td className='px-4 py-3.5 border text-center font-medium text-lg'>
                                        <Input 
                                            className='!h-auto !w-14 !bg-slate-100 !ml-3 !py-1 !text-center !text-xl !border-none !font-medium !ring-0 !outline-none !p-0' 
                                            placeholder='N/A'
                                            onChange={validateFinalGrade}
                                            max={10}
                                            maxLength={2}
                                            value={finalGrade}
                                        />
                                    </td>
                                </tr>
                                : null
                            }
                        </tbody>
                    </table>
                    { (reviewDetails.opened === true) ? <Tag className='!w-full !text-center !py-3 !h-auto !font-semibold !mt-4' color='green'>Opened</Tag> : <Tag color='red' className='!w-full !text-center !py-3 !h-auto !font-semibold !mt-4'>Closed</Tag> }
                    { (reviewDetails.opened === true) ? <Button type='primary' danger className='!w-full !h-auto !px-4 !py-3 !mt-4 !font-medium' onClick={closeWithFinalGrade}>Close With Final Grade</Button> : null }
                </div>
            </div>
            <br />
            <br />
            <hr />
            {
                (reviewDetails.opened === true)
                ? 
                <div className='p-3 flex flex-col gap-4 items-start mx-auto' style={{
                    maxWidth: 1120,
                }}>
                    <div className='flex justify-between w-full'>
                        <div className='flex items-center gap-3 w-full'>
                            <div className='rounded-full overflow-hidden border'>
                                <img width='50px' src={userInfo?.avatar} alt='avatar' />
                            </div>
                            <div className='flex flex-col'>
                                <div className='font-medium'>{userInfo?.username}</div>
                                <small className='capitalize'>{userInfo?.role}</small>
                            </div>
                        </div>
                        <Button icon={<FontAwesomeIcon icon={faPaperPlane} />} type='primary' className='!px-6 !py-2.5 !h-auto' onClick={handleComment}>Send</Button>
                    </div>
                    <div className='flex-1 flex flex-col gap-3 w-full'>
                        <Editor
                            apiKey='8f04qq8qzvwiezrbvgk61dd59ejncsww11olmcqhng8k7fsa'
                            onInit={(evt, editor) => editorRef.current = editor}
                            init={{
                                height: 250,
                                menubar: false,
                                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                                toolbar: 'blocks fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                tinycomments_mode: 'embedded',
                                content_style: 'body { font-family: Arial, sans-serif; font-size:14px }',
                                placeholder: 'Enter your reason...',
                            }}
                        />
                    </div>
                </div>   
                : <div className='text-red-500 text-left w-full p-4 font-semibold'>This review request is closed.</div>
            }
        </>
    );
};

export default ReviewDetails;