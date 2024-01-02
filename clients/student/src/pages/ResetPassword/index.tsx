import React from "react";
import {
    Form,
    Input,
    Button,
    Flex,
    message
} from "antd";
import axios from "axios";
import authStorage from "~/utils/auth.storage";
import { NavLink } from "react-router-dom";

const ResetPassword: React.FC = () => {
    const key = 'reset-password';
    const [messageApi, contextHolder] = message.useMessage();

    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        const isSocial = authStorage.isSocial();
        
        if (!isSocial) {
            messageApi.info({
                content: 'Updating password...',
                key,
                duration: 0,
            });

            axios.patch(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/reset-password`, values, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                },
            })
            .then(res => {
                messageApi.destroy(key);
                messageApi.success('Password updated successfully');
                resetForm();
            })
            .catch(err => {
                messageApi.destroy(key);
                messageApi.error(err.response?.data?.message || 'An error occurred');
                console.log(err);
            });
        }
    };

    const resetForm = () => {
        form.resetFields();
    }

    const isSocial = authStorage.isSocial();

    return (
        <>
            <div className="!mx-auto !w-full lg:!w-profile !border text-center flex justify-around mb-2 rounded-lg overflow-hidden">
                <NavLink to='/user/profile' className={({ isActive }) => (isActive) ? 'bg-primary text-white font-semibold w-full p-3' : `w-full p-3 hover:text-primary transition-all duration-150`}>User Profile</NavLink>
                <NavLink to='/user/reset-password' className={({ isActive }) => (isActive) ? 'bg-primary text-white font-semibold w-full p-3' : `w-full p-3 hover:text-primary transition-all duration-150`}>Reset Password</NavLink>
            </div>
            {contextHolder}
            {
                isSocial ?
                <div className="!mx-auto !w-full !text-center lg:!w-profile bg-blue-50 border border-blue-600 p-6 pt-5 px-6 mb-10 rounded-lg ">
                    <h1 className="font-semibold text-left mb-4">Information</h1>
                    <ul className="text-left list-inside flex flex-col gap-2 text-sm px-4">
                        <li>You are logged in with social media account.</li>
                        <li>This feature only work for login with <b className="text-primary">AWA Classroom</b>.</li>
                    </ul>
                </div>
                :
                <Form
                    form={form}
                    name="reset-password"
                    className="!mx-auto !w-full !text-center lg:!w-profile !px-0 !border !border-transparent sm:!px-10 lg:!px-12 md:!px-32 2xl:!px-10 sm:!border-gray-200 !pt-9 !pb-4 !rounded-lg"
                    layout="vertical"
                    initialValues={{
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    }}
                    onFinish={onFinish}>
                    <div className="bg-green-50 border border-primary p-6 pt-5 px-6 mb-10 rounded-lg ">
                        <h1 className="font-semibold text-left mb-2">Hint</h1>
                        <ul className="text-left list-inside list-disc flex flex-col gap-2 text-sm px-4">
                            <li>Current password is required.</li>
                            <li>Min length 8 characters.</li>
                        </ul>
                    </div>
                    <Flex gap={"1.2rem"} className="mb-4">
                        <Form.Item
                            className="!w-full !text-left"
                            name="currentPassword"
                            label="Current password"
                            rules={[
                                { 
                                    required: true, message: 'Password must not be empty'
                                },
                                {
                                    min: 8,
                                    message: 'Password must be at least 8 characters',
                                }]}
                        >
                            <Input.Password className="!p-2 !px-3"  />
                        </Form.Item>
                    </Flex>
                    <Flex gap={"1.2rem"}>
                        <Form.Item
                            className="!w-full !text-left"
                            name="newPassword"
                            label="New password"
                            rules={[
                                { 
                                    required: true, message: 'Password must not be empty'
                                },
                                {
                                    min: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (value.length >= 8 && getFieldValue('currentPassword') === value)
                                            return Promise.reject(new Error('The new password must be different from the current password'));
                                        return Promise.resolve();
                                    },
                                })
                            ]}
                        >
                            <Input.Password className="!p-2 !px-3" />
                        </Form.Item>

                        <Form.Item
                            className="!w-full !text-left"
                            name="confirmPassword"
                            label="Confirm password"
                            rules={[
                                {
                                    required: true, message: ''
                                },
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (value.length >= 8 && getFieldValue('newPassword') === value)
                                            return Promise.resolve();

                                        return Promise.reject(new Error('The password does not match'));
                                    },
                                })
                            ]}
                        >
                            <Input.Password className="!p-2 !px-3" />
                        </Form.Item>
                    </Flex>
                    <Form.Item className="!w-full !flex !justify-end !mt-4">
                        <Button
                            htmlType="button"
                            onClick={resetForm}
                            danger
                            type="primary"
                            className="mr-2 !text-sm !font-semibold !py-2 !px-4 !h-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="!text-sm !font-semibold !py-2 !px-4 !h-auto"
                        >
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            }
        </>
    );
};

export default ResetPassword;

