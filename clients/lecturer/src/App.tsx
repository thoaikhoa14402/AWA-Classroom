import axios from 'axios';
import './App.module.css';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from "~/routes/AppRoutes"
import authStorage from './utils/auth.storage';
import useAppDispatch from './hooks/useAppDispatch';
import { setClasses, setLoading } from './store/reducers/classSlice';

function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authStorage.isLogin()) {
      axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes`, {
        headers: {
          Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
        }
      })
      .then((res) => {
        const classes = res.data.data;
        dispatch(setClasses(classes));
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return <AppRoutes />
}


export default App;