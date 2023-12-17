import { faEnvelope, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, message } from 'antd';
import axios from 'axios';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import useAppSelector from '~/hooks/useAppSelector';
import useInviteModal from '~/hooks/useInviteModal';
import { ClassType } from '~/store/reducers/classSlice';
import authStorage from '~/utils/auth.storage';

const Member: React.FC = () => {

    const [details] = useOutletContext<[ClassType]>();

    const [messageApi, contextHolder] = message.useMessage();

    const userInfo = useAppSelector(state => state.user);
    const user = userInfo.profile;

    const { setOpenInviteModal, ModalContext } = useInviteModal({
        handleCreate: (values: any, tags: any, inviteLink: string, role: string) => {
            return new Promise((resolve, reject) => {
                axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/invite/${details.slug}`, {
                    emails: tags,
                    inviteLink,
                    role
                }, {
                    headers: {
                        Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                    }
                })
                .then(res => {
                    messageApi.success('Invitation sent successfully!');
                })
                .catch(err => {
                    console.log(err);
                    messageApi.error('Invitation sent failed!');
                    reject(err);
                })
                .finally(() => {
                    resolve(1);
                });
            });
        },
        handleCancel: () => {
        },
        code: details.inviteCode
    });

    return (
        details ?
        <div className='!mt-12 px-3 flex flex-col gap-10'>
            { contextHolder }
            { ModalContext }
            <div>
                <div className='flex justify-between items-center'>
                    <h1 className='text-2xl font-medium mb-2'>Lecturers</h1>
                    <Button onClick={() => setOpenInviteModal(true, 'lecturer')} className='!border-none !shadow-none !w-11 !h-11 !text-gray-500 hover:!text-primary' shape='circle' icon={<FontAwesomeIcon size='lg' icon={faUserPlus} />} />
                </div>
                <hr />
                <div className='flex flex-col my-6 mt-2 gap-2'>
                    <div className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                        <img src={details.owner.avatar} alt={details.owner.username} className='w-14 h-14 rounded-full border object-cover overflow-hidden' />
                        <p>
                            {details.owner.username} {(!details.owner.lastname && !details.owner.firstname) ? '' : `(${(details.owner.lastname || '')} ${(details.owner.firstname || '')})`}
                            { details.owner._id === user?._id ? <> - <span className="font-semibold text-primary">You</span></> : '' }
                        </p>
                        { details.owner.email && details.owner._id !== user?._id ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                    </div>
                    {details.lecturers.map((lecturer) => (
                        <div key={lecturer._id} className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                            <img src={lecturer.avatar} alt={lecturer.username} className='w-14 h-14 rounded-full border object-cover overflow-hidden' />
                            <p>
                                {lecturer.username} {(!lecturer.lastname && !lecturer.firstname) ? '' : `(${(lecturer.lastname || '')} ${(lecturer.firstname || '')})`}
                                { lecturer._id === user?._id ? <> - <span className="font-semibold text-primary">You</span></> : '' }
                            </p>
                            { lecturer.email && lecturer._id !== user?._id ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className='flex justify-between items-center'>
                    <h1 className='text-2xl font-medium mb-2'>Students</h1>
                    <Button onClick={() => setOpenInviteModal(true, 'student')} className='!border-none !shadow-none !w-11 !h-11 !text-gray-500 hover:!text-primary' shape='circle' icon={<FontAwesomeIcon size='lg' icon={faUserPlus} />} />
                </div>
                <hr />
                <div className='flex flex-col my-6 mt-2 gap-2'>
                    { details.students.length > 0
                        ? details.students.map((student) => (
                        <div key={student._id} className='flex justify-start items-center gap-6 py-2.5 px-5 hover:bg-slate-100 rounded-md cursor-pointer'>
                            <img src={student.avatar} alt={student.username} className='w-14 h-14 rounded-full border object-cover overflow-hidden' />
                            <div className='flex'>
                                <div className='flex flex-col'>
                                    <span>
                                        {student.username} {(!student.lastname && !student.firstname) ? '' : `(${(student.lastname || '')} ${(student.firstname || '')})`}
                                    </span>
                                    <small className='text-gray-500'>{ student.studentID }</small>
                                </div>
                                { student._id === user?._id ? <>&nbsp; - &nbsp;<span className="font-semibold text-primary">You</span></> : '' }
                            </div>
                            { student.email && student._id !== user?._id ? <Button className='!ml-auto' icon={<FontAwesomeIcon icon={faEnvelope} />} /> : null }
                        </div>
                        ))
                        :
                        'There no user founded'
                    }
                </div>
            </div>
        </div>
        : null
    );
};

export default Member;