import { Tabs } from 'antd';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import ReviewRequestForm from '~/components/Reviews/ReviewRequestForm';
import { ClassType } from '~/store/reducers/classSlice';

const ReviewRequest: React.FC = () => {

    const [details] = useOutletContext<[ClassType]>();

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
                <div className='px-4 py-1'>My Reviews</div>
            ),
            children: `Content of Tab Pane My Reviews`,
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