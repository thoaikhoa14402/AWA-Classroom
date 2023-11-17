import React from 'react';
import { useParams } from 'react-router-dom';

const Classes: React.FC = () => {
    const params = useParams();

    return (
        <>
            Classes { params.class_id }
        </>
    );
};

export default Classes;