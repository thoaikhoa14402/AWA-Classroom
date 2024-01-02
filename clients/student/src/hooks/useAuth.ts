import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import authStorage from '~/utils/auth.storage';
import useAppDispatch from './useAppDispatch';
import { clearUserProfile } from '~/store/reducers/userSlice';
import { useSearchParams } from 'react-router-dom';

export default function useAuth() {
    const isAuthenticated = useRef(authStorage.isLogin());
    const [isFetching, setIsFetching] = useState(true);

    isAuthenticated.current = authStorage.isLogin();

    const dispatch = useAppDispatch();

    const [searchParams, _] = useSearchParams();

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
            if (!searchParams.get('u_id')) {
                console.log('error: ', err)
                if (err.message && err.message === "canceled") {
                    isAuthenticated.current = authStorage.isLogin();
                }
                else {
                    dispatch(clearUserProfile());
                    isAuthenticated.current = false;
                }
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