import React from "react";
import { Button, Checkbox, Form, Input,Typography, Flex, message } from 'antd';
import { setUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import styles from "./LoginForm.module.css"
import axios from "axios";
import useAuth from "~/hooks/useAuth";
import authStorage from "~/utils/auth.storage";
const {Title} = Typography;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { isAuthenticated, isFetching } = useAuth();

  // if user was authenticate but the cookie is expired
  if (!authStorage.isLogin() || (authStorage.isLogin() && !isFetching && !isAuthenticated)) {
    if (authStorage.isLogin() && !isFetching && !isAuthenticated)
      messageApi.open({
        type: 'error',
        content: 'Login session has expired. Please log in again!'
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
            window.location.replace('/classroom-management');
          }, 2000)
        }
      } catch (err: any) {
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
        <Input className = {`mb-1.5 ${styles["input-style"]}`} placeholder = "Enter your username"/>
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
      </Flex>
      </Form.Item>
     
      <Form.Item>
        <Button type="primary" htmlType="submit" className = {`${styles["btn-style"]} justify-center"`} block>
            Log in to your account
        </Button>
      </Form.Item>

    </Form>
  </React.Fragment>
}

export default LoginForm;