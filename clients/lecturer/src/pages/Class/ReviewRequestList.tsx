import React from 'react';
import { Tag } from 'antd';
import { NavLink, useParams } from 'react-router-dom';

import useAppSelector from '~/hooks/useAppSelector';

const ReviewRequestList: React.FC = () => {
    const reviews = useAppSelector(state => state.reviews.reviews);

    const { classID } = useParams();

    return (
        <div className='flex flex-col gap-4'>
            {
                 reviews.length === 0 ? (
                    <div className='flex items-center justify-center flex-col gap-4'>
                        <span className='text-gray-500'>There is no review request yet</span>
                    </div>
                ) :
                reviews.map((el, index) => (
                    <NavLink to={`/classes/reviews/${classID}/view/${el._id}`} key={el._id} className='!bg-slate-50 !px-8 !py-5 !rounded-lg !text-black !border !border-slate-200'>
                        <div className='flex items-start'>
                            <div className='flex flex-col flex-1'>
                                <span className='font-medium'>#{index + 1} <b className='text-primary'>{el.joinedInfo.studentID}</b> Open a review request for <b className='text-primary'>{el.composition}</b> composition</span>
                                <small className='text-xs font-medium text-gray-500'>{el.opened ? `Request was opened by ${el.joinedInfo.studentID} on ${(el.formatedDate)}` : ''}</small>
                                <small className='mt-3' dangerouslySetInnerHTML={{__html: el.reason}}></small>
                            </div>
                            <div>
                            {
                                el.opened ? (
                                    <Tag color='green' className='!font-semibold !py-3 !px-6 !rounded-lg'>OPENED</Tag>
                                ) : (
                                    <Tag color='red' className='!font-semibold !py-3 !px-6 !rounded-lg'>CLOSED</Tag>
                                )
                            }
                            </div>
                        </div>
                    </NavLink>
                ))
            }
        </div>
    );
};

export default ReviewRequestList;