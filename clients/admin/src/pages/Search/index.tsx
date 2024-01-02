import React from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchPage: React.FC = () => {

    const [params,] = useSearchParams();

    return <>
        Keyword { params.get('q') }
    </>
};

export default SearchPage;