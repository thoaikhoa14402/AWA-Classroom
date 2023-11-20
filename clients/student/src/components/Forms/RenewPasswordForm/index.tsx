import React from "react";
import { Button, Checkbox, Form, Input,Typography, Divider, Flex, message } from 'antd';
import { NavLink, useNavigate } from "react-router-dom";
import { UserRegisterProfile, setUserRegisterProfile } from "~/store/reducers/userRegisterSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import useAppSelector from "~/hooks/useAppSelector";
import styles from "./RenewPasswordForm.module.css"
import axios from "axios";
import authStorage from "~/utils/auth.storage";

const {Title} = Typography;

const RenewPasswordForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const userProfile = useAppSelector((state) => state.userRegister.profile);
  console.log('user profile in renew password form: ', userProfile);

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
              content: 'Register information is valid!',
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
            navigate('/auth/otp-verification')
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
      <Title level={1} className = "!text-center" style = {{color: "#00A551"}}>Create a new password</Title>

      <div className="bg-green-50 border border-primary p-6 pt-5 px-6 mb-4 rounded-lg ">
        <h1 className="font-semibold text-left mb-2.5">Hint</h1>
        <ul className="text-left list-inside list-disc flex flex-col gap-2 text-sm px-4">
            <li>Use password that you don't use on any other site.</li>
            <li>Min length 8 characters.</li>
        </ul>
      </div>
                    
      <Form.Item
        label="New Password"
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
            Reset your password
        </Button>
      </Form.Item>

    </Form>
  </React.Fragment>
}

export default RenewPasswordForm;