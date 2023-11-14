import React from "react";
import { Button, Checkbox, Form, Input,Typography, Divider, Flex, message } from 'antd';
import {ReactComponent as GoogleIcon} from "~/assets/svg/google-ico.svg";
import {ReactComponent as FacebookIcon} from "~/assets/svg/facebook-ico.svg";
import {ReactComponent as GithubIcon} from "~/assets/svg/github-ico.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { UserProfile, setUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import styles from "./LoginForm.module.css"
import axios from "axios";
import useAuth from "~/hooks/useAuth";
import authStorage from "~/utils/auth.storage";
const {Title} = Typography;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { isAuthenticated, isFetching } = useAuth();

  // if user was authenticate but the cookie is expired
  if (!isFetching && authStorage.isLogin() && !isAuthenticated) {
    authStorage.logout();
    messageApi.open({
      type: 'error',
      content: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!'
    });
  } 
 
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    const key = 'updatable';
    try {
        messageApi.open({
          key,
          type: 'loading',
          content: 'Đang xử lý!',
        });
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/login`, values, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
          }
        });
        // Kiểm tra response từ API
        if (response.status === 200) { // Nếu xác thực thành công
          message.destroy(key)
        
          setTimeout(() => {
            messageApi.open({
              key,
              type: 'success',
              content: 'Đăng nhập thành công!',
            });
          }, 1500)

          dispatch(setUserProfile({
            user: response.data.user, 
            access_token: response.data.accessToken
          }));

          setTimeout(() => {
            window.location.replace('/home');
          }, 2000)
        }
      } catch (err: any) {
        setTimeout(() => {
          messageApi.open({
            key,
            type: 'error',
            content: 'Đăng nhập thất bại!',
          });
          form.setFields([
            {
              name: 'password',
              errors: [err.response.data.message],
            },
            {
              name: 'username',
              errors: [err.response.data.message],
            },
          ]); 
        }, 1500)
      }
  };
  
  return <React.Fragment>
    {contextHolder}
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      className = {styles["login-form"]}
      form = {form}
    >
      <Title level={1} className = "text-center" style = {{color: "#00A551"}}>Đăng nhập</Title>
     
      <Form.Item
        label="Tài khoản"
        name="username"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, message: 'Tài khoản không được bỏ trống!' }]}
      >
        <Input className = {`mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập tài khoản"/>
      </Form.Item>
     
      <Form.Item
        label="Mật khẩu"
        name="password"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[
        { 
          required: true, message: 'Mật khẩu không được bỏ trống!'
        },
        {
          min: 8,
          message: 'Mật khẩu phải tối thiểu 8 kí tự',
        }]}
      >
        <Input.Password className = {`mb-1 ${styles["input-style"]}`} placeholder = "Nhập mật khẩu"/>
      </Form.Item>
     
      <Form.Item
        name="remember"
        valuePropName="checked"
      >
      <Flex className = "mt-3" justify = "space-between">
      <Checkbox >Ghi nhớ đăng nhập</Checkbox>
      <span style = {{color: '#00A551', fontWeight: "500", cursor: 'pointer'}}>
        Quên mật khẩu ?
      </span>
      </Flex>
      </Form.Item>
     
      <Form.Item>
        <Button type="primary" htmlType="submit" className = {`${styles["btn-style"]} justify-center"`} block>
            Đăng nhập
        </Button>
      </Form.Item>
      
      <Divider style = {{borderColor: "black"}}>
        Phương thức khác
      </Divider>

      <Flex gap = "3rem" align = "center" justify="center">
        <NavLink to = {`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/google`}>
          <GoogleIcon/>
        </NavLink>

        <NavLink to = {`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/facebook`}>
          <FacebookIcon/>
        </NavLink>

        <NavLink to ={`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/github`}>
          <GithubIcon/>
        </NavLink>
      </Flex>

      <Flex className = "!mt-6" justify = "center" gap = "small">
        <span className={styles[""]}>
          Chưa đăng ký?
        </span>
        <span style = {{color: '#00A551', fontWeight: "600", cursor: 'pointer'}} onClick = {() => navigate('/auth/register')}>
          Đăng kí tài khoản
        </span>
      </Flex>

    </Form>
  </React.Fragment>
}

export default LoginForm;