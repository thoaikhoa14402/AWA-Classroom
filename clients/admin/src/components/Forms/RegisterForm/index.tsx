import React from "react";
import { Button, Checkbox, Form, Input,Typography, Divider, Flex, message } from 'antd';
import { NavLink, useNavigate } from "react-router-dom";
import { UserProfile, setUserProfile } from "~/store/reducers/userSlice";
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
          content: 'Đang xử lý!',
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
              content: 'Đăng ký thành công!',
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
            content: 'Đăng ký thất bại!',
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
      <Title level={1} className = "!text-center" style = {{color: "#00A551"}}>Đăng ký</Title>

      <Form.Item
        label="Tài khoản"
        name="username"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, message: 'Tài khoản không được bỏ trống!' }]}
      >
        <Input className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập tài khoản"/>
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        rules={[
        { 
          required: true,
          message: 'Email không được bỏ trống!'
        },
        {
          type: 'email',
          message: 'Email không hợp lệ!'
        }
      ]}
      >
        <Input className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập email"/>
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
        <Input.Password className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập mật khẩu"/>
      
      </Form.Item>
      
      <Form.Item
        label="Mật khẩu xác nhận"
        name="password-confirm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        dependencies={['password']}
        rules={[
        { 
          required: true, message: 'Mật khẩu xác nhận không được bỏ trống!'
        },
        {
          min: 8,
          message: 'Mật khẩu phải tối thiểu 8 kí tự',
        },
        ({getFieldValue}) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
          },
        })
        ]}
      >
        <Input.Password className = {`!mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập lại mật khẩu"/>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" className = "!mt-6 !h-11" block>
            Đăng ký
        </Button>
      </Form.Item>
      
      <Flex justify = "center" gap = "small">
        <span>
          Đã có tài khoản?
        </span>
        <span style = {{color: '#00A551', fontWeight: "600", cursor: 'pointer'}} onClick = {() => navigate('/auth/login', {replace: true})}>
          Đăng nhập
        </span>
      </Flex>

    </Form>
  </React.Fragment>
}

export default RegisterForm;