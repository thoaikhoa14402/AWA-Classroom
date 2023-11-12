import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { error } from 'console';

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
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
        });
    }, [])
   return isAuthenticated;
}