import React from "react";
import { Button, Checkbox, Form, Input,Typography, Divider, Flex, message } from 'antd';
import {ReactComponent as GoogleIcon} from "~/assets/svg/google-ico.svg";
import {ReactComponent as FacebookIcon} from "~/assets/svg/facebook-ico.svg";
import {ReactComponent as GithubIcon} from "~/assets/svg/github-ico.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { setUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import styles from "./LoginForm.module.css"
import axios from "axios";
import useAuth from "~/hooks/useAuth";
import authStorage from "~/utils/auth.storage";
import { UserRegisterProfile, setUserRegisterProfile } from "~/store/reducers/userRegisterSlice";
const {Title} = Typography;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { isAuthenticated, isFetching } = useAuth();

  // if user was authenticate but the cookie is expired
  if (!authStorage.isLogin() || (authStorage.isLogin() && !isFetching && !isAuthenticated)) {
    if (authStorage.isLogin() && !isFetching && !isAuthenticated)
      messageApi.open({
        type: 'error',
        content: 'Your login session has expired. Please log in again!'
      });
    authStorage.logout();
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
          content: 'Processing!',
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
              content: 'Login successfully!',
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
        if (err.response.status === 403) { // if account has been created but not activated yet
          message.destroy(key)
          dispatch(setUserRegisterProfile({
            user: {
              username: err.response.data.user.username,
              email: err.response.data.user.email,
            },
            verification_token: err.response.data.verificationToken
          } as UserRegisterProfile));
          // redirect to otp verification page
          messageApi.open({
            key,
            type: 'error',
            content: 'Login failed!',
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
          setTimeout(() => {
            navigate('/auth/otp-verification/register');
          }, 3000)
        }
        // If this account is failed authenticated
        else {
          setTimeout(() => {
            messageApi.open({
              key,
              type: 'error',
              content: 'Login failed!',
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
      <Title level={1} className = "text-center" style = {{color: "#00A551"}}>Log in to your account</Title>
     
      <Form.Item
        label="Username"
        name="username"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, message: 'Username must not be empty!' }]}
      >
        <Input className = {`mb-1.5 ${styles["input-style"]}` } placeholder = "Enter your username"/>
      </Form.Item>
     
      <Form.Item
        label="Password"
        name="password"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[
        { 
          required: true, message: 'Password must not be empty!'
        },
        {
          min: 8,
          message: 'Password must be at least 8 characters!',
        }]}
      >
        <Input.Password className = {`mb-1 ${styles["input-style"]}`} placeholder = "Enter your password"/>
      </Form.Item>
     
      <Form.Item
        name="remember"
        valuePropName="checked"
      >
      <Flex className = "mt-3" justify = "space-between">
      <Checkbox >Remember me</Checkbox>
      <span style = {{color: '#00A551', fontWeight: "500", cursor: 'pointer'}} onClick = {() => navigate('/auth/forgot-password')}>
        Forgot password ?
      </span>
      </Flex>
      </Form.Item>
     
      <Form.Item>
        <Button type="primary" htmlType="submit" className = {`${styles["btn-style"]} justify-center"`} block>
            Log in to your account
        </Button>
      </Form.Item>
      
      <Divider style = {{borderColor: "black"}}>
        Or connect with Social Media
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
          Not registered yet?
        </span>
        <span style = {{color: '#00A551', fontWeight: "600", cursor: 'pointer'}} onClick = {() => navigate('/auth/register')}>
         Create an account
        </span>
      </Flex>

    </Form>
  </React.Fragment>
}

export default LoginForm;