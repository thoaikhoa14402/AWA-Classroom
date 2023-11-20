import { faArrowRightToBracket, faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, MenuProps } from 'antd';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NoClassMessage } from '~/components/Class';
import useCreateClassModal from '~/hooks/useCreateClassModal';

const Classes: React.FC = () => {
    const params = useParams();

    const classes = [];

    const navigate = useNavigate();
    
    const handleCreate = (values: any) => {
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('create a class', values);
                navigate(`/classes/${values.name}`);
                resolve(1);
            }, 2000);
        });
    }

    const handleCancel = () => {
        console.log('cancel create a class');
    }

    const { setOpenCreateModal, ModalContext } = useCreateClassModal(
        {
            handleCreate,
            handleCancel,
        }
    );

    const items: MenuProps["items"] = [
        {
            key: "create-class",
            label: 'Create a class',
            icon: <FontAwesomeIcon icon={faPlus} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => setOpenCreateModal(true)
        },
        {
            key: "join-class",
            label: 'Join a class',
            icon: <FontAwesomeIcon icon={faArrowRightToBracket} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
        }
    ];

    return (
        <>
            { ModalContext }
            {
                classes.length 
                ? 
                <div className='flex justify-end items-center'>
                    <span className='mr-auto'>Classes { params.class_id }</span>
                    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-0'>
                        <Button shape='circle' className='!w-10 !h-10'>
                            <FontAwesomeIcon icon={faEllipsis} size='lg' />
                        </Button>
                    </Dropdown>
                </div>
                : <NoClassMessage />
            }  
        </>
    );
};

export default Classes;