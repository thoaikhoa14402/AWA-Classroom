import React, {useEffect} from "react";
import { useLocation } from 'react-router-dom';
import { setUserProfile } from "~/store/reducers/userSlice";
import {message} from 'antd'
import LoginForm from "~/components/Forms/LoginForm";
import axios from "axios";
import useAppDispatch from "~/hooks/useAppDispatch";

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const key = 'updatable';
    // Trường hợp cho việc xác thực bằng Social Oauth
    useEffect(() => {
        // Lấy giá trị của tham số 'u_id' từ query parameters
        const queryParams = new URLSearchParams(location.search);
        const u_id = queryParams.get('u_id');
        const access_token = queryParams.get('access_token');
        // Kiểm tra xem query string có thay đổi không
        if (u_id !== null && access_token !== null) { // có u_id tức người dùng đã xác thực bằng Social Oauth thành công, và cần yêu cầu lấy thông tin user về để lưu vào localStorage
            messageApi.open({
                key,
                type: 'loading',
                content: 'Đang xử lý!',
            });
            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/${u_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': access_token ? `Bearer ${access_token}` : ''
                }
            }).then((response) => {
                if (response.status === 200) {
                    message.destroy(key)
            
                    setTimeout(() => {
                        messageApi.open({
                        key,
                        type: 'success',
                        content: 'Login successfully!',
                        });
                    }, 1500)

                    dispatch(setUserProfile({
                        user: response.data.user, 
                        access_token
                    }));

                    setTimeout(() => {
                        window.location.replace('/home');
                    }, 2000)

                    // set user's profile to local storage
                    // authStorage.login(response.data.user);
                }
            }).catch((err) => {
                console.log('error: ', err);
                messageApi.open({
                    key,
                    type: 'error',
                    content: 'Login failed!',
                    duration: 2
                  });
            });
        }
      }, [location.search]); // Chỉ gọi lại useEffect khi location.search thay đổi
    return <React.Fragment>
        {contextHolder}
        <LoginForm/>
    </React.Fragment>
}

export default LoginPage;