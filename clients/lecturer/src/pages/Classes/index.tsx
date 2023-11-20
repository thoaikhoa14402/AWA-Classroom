import React from 'react';
import { useParams } from 'react-router-dom';
import { NoClassMessage } from '~/components/Class';

const Classes: React.FC = () => {
    const params = useParams();

    const classes = [];

    return (
        <>
            {
                classes.length 
                ? `Classes ${ params.class_id }`
                : <NoClassMessage />
            }  
        </>
    );
};

export default Classes;