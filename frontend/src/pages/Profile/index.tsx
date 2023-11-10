import React from "react";
import { Form, Input, Upload, Button, Avatar, Select, Divider, Space, Flex, Row, Col } from "antd";
import { StyleProvider } from '@ant-design/cssinjs';
import { UserOutlined, UploadOutlined } from "@ant-design/icons";

const Profile: React.FC = () => {

    const onFinish = (values: any) => {
        // Handle form submission logic
        console.log("Received values:", values);
    };

    return (
        <Form
            name="user-profile-form"
            className="!mx-auto !w-full !text-center lg:!w-1/2 !px-0 !border !border-transparent sm:!px-10 lg:!px-12 md:!px-32 2xl:!px-20 sm:!border-gray-200 !pt-9 !pb-4 !rounded-lg"
            layout="vertical"
            initialValues={{
                username: "john_doe",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phoneNumber: "1234567890",
                role: "user",
            }}
        >
            <Flex justify="center">
                <Form.Item name="avatar">
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false}>
                        <Flex align="center" vertical>
                            <Avatar size={124} icon={<UserOutlined />} className="!mb-5" />
                            <Button icon={<UploadOutlined />} className="!py-2 !text-center !h-auto">
                                Chọn ảnh
                            </Button>
                        </Flex>
                    </Upload>
                </Form.Item>
            </Flex>

            <div className="!mb-8 !flex !w-full !justify-center !items-center !gap-2">
                <b className="!text-xl">Minh Nguyen</b>
                <small className="!text-sm !text-gray-600">(Học viên)</small>
            </div>
            
            <Flex gap={'1.2rem'}>
                <Form.Item
                    className="!w-full"
                    name="firstName"
                    label="Tên"
                    rules={[
                        {
                            required: true,
                            message: "Please input your first name!",
                        },
                    ]}>
                    <Input className="!p-2 !px-3" />
                </Form.Item>

                <Form.Item
                    className="!w-full"
                    name="lastName"
                    label="Họ và tên đệm"
                    rules={[
                        { required: true, message: "Please input your last name!" },
                    ]}>
                    <Input className="!p-2 !px-3" />
                </Form.Item>
            </Flex>
            <Flex gap={'1.2rem'}>
                <Form.Item
                    className="!w-full"
                    name="email"
                    label="Địa chỉ email"
                    rules={[
                        { type: "email", message: "Invalid email address!" },
                        { required: true, message: "Please input your email!" },
                    ]}>
                    <Input className="!p-2 !px-3" />
                </Form.Item>

                <Form.Item
                    className="!w-full"
                    name="phoneNumber"
                    label="Số điện thoại"
                    rules={[
                        {
                            pattern: /^\d+$/,
                            message: "Please enter a valid phone number!",
                        },
                    ]}>
                    <Input className="!p-2 !px-3" />
                </Form.Item>
            </Flex>
                <Form.Item className="!w-full !flex !justify-end">
                    <Button htmlType="submit" className="mr-2">
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Cập nhật
                    </Button>
                </Form.Item>
        </Form>
    );
};

export default Profile;

