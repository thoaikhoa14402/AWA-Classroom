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
					<GradeStructure />
                    <StudentList />
                    <StudentGradeList />
                </div>
            : null }
        </>
    );
};

export default Grade;