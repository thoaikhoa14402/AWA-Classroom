import { faEnvelope, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';

const Member: React.FC = () => {

    const [details] = useOutletContext<[ClassType]>();

    console.log(details);

    return (
        details ?
        <div className='!mt-12 px-3 flex flex-col gap-10'>
            <div>
                <div className='flex justify-between items-center'>
                    <h1 className='text-2xl font-medium mb-2'>Lecturers</h1>
                    <Button className='!border-none !shadow-none !w-11 !h-11 !text-gray-500 hover:!text-primary' shape='circle' icon={<FontAwesomeIcon size='lg' icon={faUserPlus} />} />
                </div>
                <hr />
                <div className='flex flex-col my-6'>
                    <div className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                        <img src={details.owner.avatar} alt={details.owner.username} className='w-14 h-14 rounded-full border object-cover' />
                        <p>{details.owner.username} ({details.owner.lastname + ' ' + details.owner.firstname})</p>
                        { details.owner.email ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                    </div>
                    {details.lecturers.map((lecturer) => (
                        <div key={lecturer._id} className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                            <img src={lecturer.avatar} alt={lecturer.username} className='w-14 h-14 rounded-full border object-cover' />
                            <p>{lecturer.username} ({lecturer.lastname + ' ' + lecturer.firstname})</p>
                            { details.owner.email ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className='flex justify-between items-center'>
                    <h1 className='text-2xl font-medium mb-2'>Students</h1>
                    <Button className='!border-none !shadow-none !w-11 !h-11 !text-gray-500 hover:!text-primary' shape='circle' icon={<FontAwesomeIcon size='lg' icon={faUserPlus} />} />
                </div>
                <hr />
                <div className='flex flex-col my-6'>
                    {details.students.map((student) => (
                        <div key={student._id} className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                            <img src={student.avatar} alt={student.username} className='w-14 h-14 rounded-full border object-cover' />
                            <p>{student.username} ({student.lastname + ' ' + student.firstname})</p>
                            { details.owner.email ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                        </div>
                    ))}
                </div>
            </div>
        </div>
        : null
    );
};

export default Member;