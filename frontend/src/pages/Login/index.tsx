import React, {useEffect} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile, setUserProfile } from "~/store/reducers/userSlice";
import {message} from 'antd'
import LoginForm from "~/components/Forms/LoginForm";
import axios from "axios";
import useAppDispatch from "~/hooks/useAppDispatch";
import authStorage from "~/utils/auth.storage";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const key = 'updatable';
    // Trường hợp cho việc xác thực bằng Social Oauth
    useEffect(() => {
        // Lấy giá trị của tham số 'u_id' từ query parameters
        const queryParams = new URLSearchParams(location.search);
        const u_id = queryParams.get('u_id');
        // Kiểm tra xem query string có thay đổi không
        if (u_id !== null) { // có u_id tức người dùng đã xác thực bằng Social Oauth thành công, và cần yêu cầu lấy thông tin user về để lưu vào localStorage
            messageApi.open({
                key,
                type: 'loading',
                content: 'Đang xử lý!',
            });
            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/${u_id}`, {
            withCredentials: true,
            }).then((response) => {
                if (response.status === 200) {
                    message.destroy(key)
            
                    setTimeout(() => {
                        messageApi.open({
                        key,
                        type: 'success',
                        content: 'Đăng nhập thành công!',
                        });
                    }, 1500)

                    dispatch(setUserProfile(response.data.user as UserProfile))
                    setTimeout(() => {
                        navigate('/home')
                    }, 2000)

                    // set user's profile to local storage
                    // authStorage.login(response.data.user);
                }
            }).catch((err) => {
                console.log('error: ', err);
                messageApi.open({
                    key,
                    type: 'error',
                    content: 'Đăng nhập thất bại!',
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