import React from "react";
import { Button, Form, Input,Typography, Flex, message } from 'antd';
import { useNavigate } from "react-router-dom";
import { UserRegisterProfile, setUserRegisterProfile } from "~/store/reducers/userRegisterSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import styles from "./RegisterForm.module.css"
import axios from "axios";
import authStorage from "~/utils/auth.storage";

const {Title} = Typography;

const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

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
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/register`, values, {
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
              content: response.data.message,
            });
          }, 1500)

          dispatch(setUserRegisterProfile({
            user: {
              username: values.username,
              email: values.email,
            },
            verification_token: response.data.verificationToken
          } as UserRegisterProfile));

          setTimeout(() => {
            // window.location.replace('/home');
            navigate('/auth/otp-verification/register')
          }, 2500)
        }
      } catch (err: any) {
        setTimeout(() => {
          messageApi.open({
            key,
            type: 'error',
            content: 'Register failed!',
          });
          form.setFields([
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
      className = {styles["register-form"]}
      form = {form}
    >
      <Title level={1} className = "!text-center" style = {{color: "#00A551"}}>Create an account</Title>

      <Form.Item
        label="Username"
        name="username"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, message: 'Username must not be empty!' }]}
      >
        <Input className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Enter your username"/>
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[
        { 
          required: true,
          message: 'Email must not be empty!'
        },
        {
          type: 'email',
          message: 'Email format is not valid!'
        }
      ]}
      >
        <Input className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Enter your email"/>
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
        <Input.Password className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Enter your password"/>
      
      </Form.Item>
      
      <Form.Item
        label="Confirm Password"
        name="password-confirm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        dependencies={['password']}
        rules={[
        { 
          required: true, message: 'Password confirm must not be empty!'
        },
        {
          min: 8,
          message: 'Password must be at least 8 characters!',
        },
        ({getFieldValue}) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Password does not match!'));
          },
        })
        ]}
      >
        <Input.Password className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Enter your password"/>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" className = "!mt-6 !h-11" block>
            Create your account
        </Button>
      </Form.Item>
      
      <Flex justify = "center" gap = "small">
        <span>
          Already have an account?
        </span>
        <span style = {{color: '#00A551', fontWeight: "600", cursor: 'pointer'}} onClick = {() => navigate('/auth/login', {replace: true})}>
          Log in
        </span>
      </Flex>

    </Form>
  </React.Fragment>
}

export default RegisterForm;