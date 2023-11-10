import React, { useState } from "react";
import { Button, Checkbox, Form, Input,Typography, Divider, Flex, Segmented, Space, Row, message } from 'antd';
import {StyleProvider} from '@ant-design/cssinjs';
import {ReactComponent as GoogleIcon} from "~/assets/svg/google-ico.svg";
import {ReactComponent as FacebookIcon} from "~/assets/svg/facebook-ico.svg";
import {ReactComponent as GithubIcon} from "~/assets/svg/github-ico.svg";
import { NavLink } from "react-router-dom";
import { UserProfile, setUserProfile } from "~/store/reducers/userSlice";
import useAppDispatch from "~/hooks/useAppDispatch";
import useAppSelector from "~/hooks/useAppSelector";
import eLearningImg from '~/assets/images/e-learning.jpg'
import styles from "./LoginForm.module.css"
import axios from "axios";

const {Title} = Typography;

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state) => state.user.profile as UserProfile);
  console.log('user Profile', userProfile);

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
        const response = await axios.post('http://localhost:5000/v1/auth/login', values, {
          withCredentials: true,
        });
        // Kiểm tra response từ API
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
          form.resetFields();
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
        
        // console.error(err);
      }
  };
  
  return <Flex>
    {contextHolder}
    <div className = 'w-1/2'>
      <img src = {eLearningImg} className = "w-full h-full"/>
    </div>
    <div className = "w-1/2 flex justify-center items-center h-screen">
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        className = {styles["login-form"]}
        form = {form}
      >
        <Form.Item className = "text-center">
          <Title level={1} style = {{color: "#00A551"}}>Đăng nhập</Title>
        </Form.Item>
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
            min: 6,
            message: 'Mật khẩu phải tối thiểu 8 kí tự',
          }]}
        >
          <Input.Password className = {`mb-1.5 ${styles["input-style"]}`} placeholder = "Nhập mật khẩu"/>
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
        <StyleProvider hashPriority= "high">
          <Button type="primary" htmlType="submit" className = {`${styles["btn-style"]} justify-center"`} block>
              Đăng nhập
          </Button>
        </StyleProvider>
        </Form.Item>
        <Divider style = {{borderColor: "black", fontSize: "2rem"}}>
          Phương thức khác
        </Divider>

        <Flex gap = "3rem" align = "center" justify="center">
          <NavLink to = "http://localhost:5000/v1/auth/google">
            <GoogleIcon/>
          </NavLink>

          <NavLink to = "http://localhost:5000/v1/auth/facebook">
            <FacebookIcon/>
          </NavLink>

          <NavLink to = "http://localhost:5000/v1/auth/github">
            <GithubIcon/>
          </NavLink>
        </Flex>

       <Flex className = "mt-10" justify = "center" gap = "small">
        <span className={styles[""]}>
          Chưa đăng ký?
        </span>
        <span style = {{color: '#00A551', fontWeight: "600", cursor: 'pointer'}}>
          Đăng kí tài khoản
        </span>
       </Flex>
      </Form>
  </div>
  </Flex>
  
}

export default LoginForm;