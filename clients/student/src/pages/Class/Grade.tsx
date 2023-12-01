import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';
import GradeStructure from './GradeStructure';
import StudentList from './StudentList';
import StudentGradeList from './StudentGradeList';

const Grade: React.FC = () => {
    const [details] = useOutletContext<[ClassType]>();

    return (
        <>
            { details ? 
                <div className='!mt-12 px-3 flex flex-col gap-10'>
                    {/* <div className='flex justify-end'>
                        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                            <Button className='!p-3 !px-5 !h-auto !w-auto !flex !justify-center !items-center' icon={<FontAwesomeIcon icon={faShapes} size='lg' />}>
                                <span className='mr-4'>Templates</span><FontAwesomeIcon icon={faAngleDown} />
                            </Button>
                        </Dropdown>
                    </div> */}
                    <StudentGradeList />
					<GradeStructure />
                    <StudentList />
                </div>
            : null }
        </>
    );
};

export default Grade;