import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import authStorage from '~/utils/auth.storage';

export default function useAuth() {
    let isAuthenticated: boolean = authStorage.isLogin();
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
                isAuthenticated = true;
            }
        }).catch((err) => {
            console.log('error: ', err)
            if (err.message && err.message === "canceled") {
                isAuthenticated = authStorage.isLogin();
            }
        }).finally(() => {
            setIsFetching(false);
        });

        return () => {
            controller.abort();
        }
    }, [isAuthenticated, location]);
   
    return { isAuthenticated: isAuthenticated, isFetching };
}