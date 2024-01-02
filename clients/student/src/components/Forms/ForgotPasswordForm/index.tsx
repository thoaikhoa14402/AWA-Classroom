import React from "react";
import { Button, Form, Input,Typography, message } from 'antd';
import { useNavigate } from "react-router-dom";
import { UserRegisterProfile, setUserRegisterProfile } from "~/store/reducers/userRegisterSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import useAppSelector from "~/hooks/useAppSelector";
import styles from "./ForgotPasswordForm.module.css"
import axios from "axios";

const {Title} = Typography;

const ForgotPasswordForm: React.FC = () => {
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

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/resend-otp`,values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ''
        }
      });

      if (response.status === 200) { // Nếu xác thực thành công
        message.destroy(key)

        setTimeout(() => {
          messageApi.open({
            key,
            type: 'success',
            content: response.data.message,
          });
        }, 1500)

        localStorage.setItem('verificationToken', response.data.verificationToken);

        dispatch(setUserRegisterProfile({
          user: {
            username: response.data.user.username,
            email: response.data.user.email,
          },
          verification_token: response.data.verificationToken,
        } as UserRegisterProfile))
        
        setTimeout(() => {
          navigate('/auth/otp-verification/forgot')
        }, 2500)

      }
    } catch (err: any)  {
      setTimeout(() => {
        messageApi.open({
          key,
          type: 'error',
          content: 'Verify failed!',
        });
        form.setFields([
          {
            name: 'username',
            errors: [err.response.data.message],
          },
          {
            name: 'email',
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
      <Title level={1} className = "!text-center" style = {{color: "#00A551"}}>Forgot Password</Title>

      <div className = "!bg-green-50 !border !border-primary  !flex !flex-col !items-center !rounded-lg !p-3.5 !mb-4" >
        <span>
        Please enter your information to receive OTP code by email
        </span>
        <span className = "!font-semibold">
       This is an important step to protect your account
        </span>
      </div>

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

      
      <Form.Item>
        <Button type="primary" htmlType="submit" className = "!mt-6 !h-11" block>
            Continue
        </Button>
      </Form.Item>
      
    </Form>
  </React.Fragment>
}

export default ForgotPasswordForm;