import axios from 'axios';
import './App.module.css';

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from "~/routes/AppRoutes"
import authStorage from './utils/auth.storage';
import useAppDispatch from './hooks/useAppDispatch';
import { setClasses, setLoading } from './store/reducers/classSlice';
import { socket } from './utils/socket';
import { Avatar, notification } from 'antd';
import { pushNotification, setNotificationLoading, setNotifications } from './store/reducers/notifcationSlice';

function App() {
  const [api, contextHolder] = notification.useNotification();
  
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isConnect = useRef(false);

  const navigate = useNavigate();

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
      
      axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/notifications`, {
        headers: {
          Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
        }
      })
      .then((res) => {
        dispatch(setNotifications(res.data.data));
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setNotificationLoading(false));
      });
    }

    return () => {
      dispatch(setLoading(false));
      dispatch(setNotificationLoading(false));
    }
  }, []);

  useEffect(() => {
    if (socket.active && socket.connected && authStorage.isLogin()) {
      socket.emit('subscribe', {
        user_id: authStorage.getUserProfile()._id
      });
    }
    
    if (!isConnect.current && authStorage.isLogin()) {
      isConnect.current = true;

      socket.connect();
      socket.emit('subscribe', {
        user_id: authStorage.getUserProfile()._id
      });

      socket.on('notification', (data) => {
        api.open({
          message:
            <span className='text-gray-600 font-semibold flex flex-col text-sm gap-1'>
              <span>{data.notification.class.cid} - {data.notification.class.name}</span>
            </span>,
          description: <span>
            <span className='text-primary font-semibold'>{data.username}</span>&nbsp;
            {data.message}
          </span>,
          icon: <Avatar src={data.avatar} />,
          onClick: () => {
            navigate(data.navigation);
          },
          className: "hover:!cursor-pointer"
        });

        dispatch(pushNotification(data.notification));
      });
    }
    else if (!authStorage.isLogin() || !socket.active) {
      socket.disconnect();
      isConnect.current = false;
    }

    window.scrollTo(0, 0);
  }, [location]);

  return <>
    {contextHolder}
    <AppRoutes />
  </>
}


export default App;