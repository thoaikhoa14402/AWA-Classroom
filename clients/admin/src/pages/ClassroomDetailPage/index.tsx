import React from 'react';
import ClassroomDetailTable from '~/components/Tables/ClassroomDetail/ClassroomDetail';
import MappingTable from '~/components/Tables/Mapping/Mapping';

const ClassroomDetail: React.FC = () => {
    return (
        <>
            <ClassroomDetailTable/>
            <MappingTable />
        </>
    );
};

export default ClassroomDetail;