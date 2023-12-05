import { Tabs } from 'antd';
import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import ReviewRequestForm from '~/components/Reviews/ReviewRequestForm';
import useAppSelector from '~/hooks/useAppSelector';
import { ClassType } from '~/store/reducers/classSlice';
import ReviewRequestList from './ReviewRequestList';

const ReviewRequest: React.FC = () => {

    const [details] = useOutletContext<[ClassType]>();
    const reviews = useAppSelector(state => state.reviews.reviews);

    const openedReviews = useMemo(() => (reviews.filter(review => review.opened)), [reviews]);

    const onChange = (key: string) => {
        console.log(key);
    };

    const TabTable = [
        {
            key: 'Review Request',
            label: (
                <div className='px-4 py-1'>Review Request</div>
            ),
            children: <ReviewRequestForm details={details} />,
        },
        {
            key: 'My Reviews',
            label: (
                <div className='px-4 py-1 flex gap-2 items-center justify-center'>
                    <span>My Reviews</span> 
                    <div className='w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-xs font-semibold'>{ openedReviews.length }</div>
                </div>
            ),
            children: <ReviewRequestList />,
        }
    ];

    return (
        <Tabs
            defaultActiveKey='Review Request'
            type='card'
            onChange={onChange}
            items={TabTable}
        />
    );
};

export default ReviewRequest;