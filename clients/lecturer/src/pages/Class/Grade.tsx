import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';
import GradeStructure from './GradeStructure';
import { Button, Dropdown, MenuProps } from 'antd';
import { faAngleDown, faDownload, faShapes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Grade: React.FC = () => {
    const [details] = useOutletContext<[ClassType]>();
    
    const items: MenuProps["items"] = [
        {
            key: "export-student-list",
            label: 'Student list',
            icon: <FontAwesomeIcon icon={faDownload} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
        },
    ];

    return (
        <>
            { details ? 
                <div className='!mt-12 px-3 flex flex-col gap-10'>
                    <div className='flex justify-end'>
                        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                            <Button className='!p-3 !px-5 !h-auto !w-auto !flex !justify-center !items-center' icon={<FontAwesomeIcon icon={faShapes} size='lg' />}>
                                <span className='mr-4'>Templates</span><FontAwesomeIcon icon={faAngleDown} />
                            </Button>
                        </Dropdown>
                    </div>
					<GradeStructure />
                </div>
            : null }
        </>
    );
};

export default Grade;