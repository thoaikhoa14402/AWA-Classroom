import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Typography } from 'antd';
import { ClassType } from '~/store/reducers/classSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClone } from '@fortawesome/free-solid-svg-icons';

interface ClassCardProps { 
    details: ClassType
}

const ClassCard: React.FC<ClassCardProps> = ({ details }) => {
    const navigate = useNavigate();

    return  ( 
        <Card
            onClick={() => {
                navigate(`/classes/feeds/${details.slug}`);
            }}
            hoverable
            style={{ width: 340 }}
            cover={<div className='relative h-40'>
                <Typography.Text 
                    className='absolute left-0 top-0 !z-1 !text-white m-3'
                    copyable={{
                        text: details.inviteCode,
                        tooltips: ['Copy', 'Copied!'],
                        icon: [<FontAwesomeIcon key={details.inviteCode} icon={faClone} className='text-gray-300 hover:text-white ml-1' />, <FontAwesomeIcon key={`copied_${details.inviteCode}`} className='ml-1' icon={faCheck} color='lightgreen' />]
                    }}>{ details.inviteCode }</Typography.Text>
                {/* <div className='absolute left-0 top-0 !z-1 text-white m-3'>{ details.inviteCode }</div> */}
                <img alt={details.name} className='object-cover absolute w-full h-full !z-0' src={details.banner} />
            </div>}>
            <div className='flex justify-between items-center'>
                <Card.Meta title={details.cid} description={details.name} />
                <div className='flex flex-col-reverse justify-between items-center'>
                    <small className='font-medium'>{ details.owner.username }</small>
                    <Avatar size='large' src={details.owner.avatar} alt={details.owner.avatar} />
                </div>
            </div>
        </Card>
    );
};

export default ClassCard;