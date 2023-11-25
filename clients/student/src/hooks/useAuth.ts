import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import authStorage from '~/utils/auth.storage';

export default function useAuth() {
    const isAuthenticated = useRef(authStorage.isLogin());
    const [isFetching, setIsFetching] = useState(true);

    isAuthenticated.current = authStorage.isLogin();

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
            isAuthenticated.current = false;
            console.log('error: ', err)
            if (err.message && err.message === "canceled") {
                isAuthenticated.current = authStorage.isLogin();
            }
        }).finally(() => {
            setIsFetching(false);
        });

        return () => {
            controller.abort();
        }
    }, []);
   
    return { isAuthenticated: isAuthenticated.current, isFetching };
}