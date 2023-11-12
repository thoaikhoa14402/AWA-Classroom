import {useState, useEffect} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const location = useLocation();
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/is-login`, {
            withCredentials: true,
        }).then((response) => {
            if (response.status === 200) {
                setIsAuthenticated(true);
            }
        }).catch((err) => {
            console.log('error: ', err)
            setIsAuthenticated(false);
        }).finally(() => {
            setIsFetching(false);
        });
    }, [isAuthenticated, location]);
   
    return { isAuthenticated, isFetching };
}