import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import authStorage from '~/utils/auth.storage';

export default function useAuth() {
    const isAuthenticated = useRef<boolean>(false);
    const [isFetching, setIsFetching] = useState(true);

    const location = useLocation();
    
    useEffect(() => {
        const controller = new AbortController();
 
        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/is-login`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
            },
            signal: controller.signal
        }).then((response) => {
            if (response.status === 200) {
                isAuthenticated.current = true;
            }
        }).catch((err) => {
            console.log('error: ', err)
            if (err.response && err.response.status === 401) {
                isAuthenticated.current = false;
            } 
            else if (err.response?.data && err.response.data === 'No Auth Token' && err.response.status === 500) {
                isAuthenticated.current = false;
            }
            else if (authStorage.isLogin()) {
                isAuthenticated.current = true;
            }
        }).finally(() => {
            setIsFetching(false);
        });

        return () => {
            controller.abort();
        }
    }, [isAuthenticated, location]);
   
    return { isAuthenticated: isAuthenticated.current, isFetching };
}