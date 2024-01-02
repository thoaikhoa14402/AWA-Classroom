import React, { useState } from "react";
import { Button, Form, Input,Typography, message } from 'antd';
import { useNavigate } from "react-router-dom";
import { setUserRegisterProfile, clearUserRegisterProfile, UserRegisterProfile } from "~/store/reducers/userRegisterSlice";
import { setUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import styles from "./OTPVerificationForm.module.css"
import axios from "axios";
import useAppSelector from "~/hooks/useAppSelector";

const {Title} = Typography;

interface OTPVerificationFormProps {
  type: 'register' | 'forgot'; 
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({type}) => {
  const [isFailedAuthenticated, setIsFailedAuthenticated] = useState(false);
  const dispatch = useAppDispatch();
  const verificationToken = useAppSelector((state) => state.userRegister.verification_token);
  const userRegisterProfile = useAppSelector((state) => state.userRegister.profile);
  const username = userRegisterProfile?.username;
  const email = userRegisterProfile?.email;
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
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/verify-user-registration`, {
          username: username,
          email: email,
          verification_code: values.verification_code,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('verificationToken') ?  `Bearer ${localStorage.getItem('verificationToken')}` : `Bearer ${verificationToken}`
          }
        });
        // Kiểm tra response từ API
        if (response.status === 200) { // Nếu xác thực thành công
          message.destroy(key)
          if (type === "register") {
            setTimeout(() => {
              messageApi.open({
                key,
                type: 'success',
                content: 'Register successfully!',
              });
            }, 1500)

            // set user profile when response returned
            dispatch(setUserProfile({
              user: response.data.user,
              access_token: response.data.accessToken
            }));

            setTimeout(() => {
              // reset user register profile to null
              dispatch(clearUserRegisterProfile());
              localStorage.removeItem("verificationToken");
            }, 2500)

            // Then let the protected otp route redirect user to home page
          }

          else if (type === "forgot") {
            setTimeout(() => {
              messageApi.open({
                key,
                type: 'success',
                content: 'Verification code is valid!',
              });
            }, 1500)
            setTimeout(() => {
              // redirect user to reset password page
              navigate('/auth/renew-password');
            }, 2500)
          }
          
        }
      } catch (err: any) {
        setTimeout(() => {
          messageApi.open({
            key,
            type: 'error',
            content: 'Authenticated failed!',
          });
          form.setFields([
            {
              name: 'verification_code',
              errors: [err.response.data.message],
            },
          ]); 
          setIsFailedAuthenticated(true);
        }, 1500)
      }
  };

  const handleResendOTP = async () => {
    const key = 'updatable';
    try {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Processing!',
      });
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/auth/resend-otp`, {
        username: username, 
        email: email, 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ''
        }
      });
      localStorage.setItem('verificationToken', response.data.verificationToken);
      if (response.status === 200) { // Nếu xác thực thành công
        message.destroy(key)
        setTimeout(() => {
          messageApi.open({
            key,
            type: 'success',
            content: response.data.message,
          });
        }, 1500)
        setUserRegisterProfile({
          user: {
            ...userRegisterProfile
          },
          verification_token: response.data.verificationToken,
        } as UserRegisterProfile)
      }
    } catch (err: any)  {
      setTimeout(() => {
        messageApi.open({
          key,
          type: 'error',
          content: 'Register failed!',
        });
        form.setFields([
          {
            name: 'verification_code',
            errors: [err.response.data.message],
          },
        ]); 
        setIsFailedAuthenticated(true);
      }, 1500)
    }
  
  }
  
  return <React.Fragment>
    {contextHolder}
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      className = {styles["otp-verification-form"]}
      form = {form}
    >
      <Title level={1} className = "!text-center" style = {{color: "#00A551"}}>OTP Verification</Title>

      <div className = "!bg-green-50 !border !border-primary  !flex !flex-col !items-center !rounded-lg !p-3.5 !mb-4" >
        <span>
        We've sent a verification code to your email
        </span>
        <span className={styles[""]}>
        Please enter it below
        </span>
      </div>

      <Form.Item
        label="Verification Code"
        name="verification_code"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, message: 'Verification code must not be empty!' }]}
        className = "!mt-6"
      >
        <Input className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Enter verification code"/>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className = "!mt-6 !h-11" block>
            Submit
        </Button>
      </Form.Item>

      {isFailedAuthenticated && 
        <Form.Item>
        <Button className = "!bg-red-500 !h-11 !text-white !border-transparent !hover:bg-red-200" block onClick = {handleResendOTP}>
            Resend OTP
        </Button>
      </Form.Item>
      }
  
    </Form>
  </React.Fragment>
}

export default OTPVerificationForm;