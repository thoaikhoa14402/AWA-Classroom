import React from 'react';
import { NoActivityMessage } from '~/components/Home';

const HomePage: React.FC = () => {
    const classes = [];

    return (
        <>
            {
                classes.length 
                ? <div>Home</div>
                : <NoActivityMessage />
            }  
        </>
    );
};

export default HomePage;