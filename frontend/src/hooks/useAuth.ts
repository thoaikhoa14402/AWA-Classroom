import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export default function useAuth() {
    const isAuthenticated = useRef<boolean>(false);

    const [isFetching, setIsFetching] = useState(true);

    const location = useLocation();
    
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/is-login`, {
            withCredentials: true,
        }).then((response) => {
            if (response.status === 200) {
                isAuthenticated.current = true;
            }
        }).catch((err) => {
            console.log('error: ', err)
            isAuthenticated.current = false;
        }).finally(() => {
            setIsFetching(false);
        });
    }, [isAuthenticated, location]);
   
    return { isAuthenticated: isAuthenticated.current, isFetching };
}