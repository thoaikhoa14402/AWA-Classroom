import React, { useState } from "react";
import {
    Form,
    Input,
    Upload,
    Button,
    Flex,
    UploadFile,
    message
} from "antd";
import { CameraOutlined, LoadingOutlined } from "@ant-design/icons";
import { RcFile, UploadChangeParam, UploadProps } from "antd/es/upload";
import ImgCrop from 'antd-img-crop';
import validate from "~/utils/validateImages";
import axios from "axios";
import useAppSelector from "~/hooks/useAppSelector";
import useAppDispatch from "~/hooks/useAppDispatch";
import { setUserProfile } from "~/store/reducers/userSlice";
import authStorage from "~/utils/auth.storage";
import { NavLink } from "react-router-dom";

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const Profile: React.FC = () => {
    const userProfile = useAppSelector(state => state.user.profile)!;

    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    const [form] = Form.useForm();

    const [change, setChange] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>(userProfile?.avatar ?? '');

    const beforeUpload = (file: RcFile) => {
        const error = validate(file);

        if (error !== false) {
            messageApi.error(error);    
        }

        return error === false;
    };

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setIsLoading(true);
            return;
        }
        if (info.file.status === 'error') {
            setIsLoading(false);
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj as RcFile)
            .then((url) => {
                setIsLoading(false);
                setImageUrl(url);
            });
        }
    };

    const handleUploadFile = (options: any) => { 
        const { onSuccess, onError, file, onProgress } = options;
        
        const formData = new FormData();
        formData.append("avatar", file);
        
        axios.put(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
            },
            onUploadProgress: (event: any) => onProgress({ percent: (event.loaded / event.total) * 100 })
        })
        .then((response: any) => {
            messageApi.success(`Avatar upload successfully`);
            
            dispatch(setUserProfile({
                user: {
                    ...userProfile,
                    avatar: response.data.data.secure_url || response.data.data.url
                },
                access_token: authStorage.getAccessToken() || '',
            }));

            onSuccess(userProfile.avatar);
        })
        .catch((error) => { 
            messageApi.error(`Update failed`);
            onError({ error });
        });
    };

    const onFinish = (values: any) => {
        axios.patch(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/profile`, values, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
            },
        })
        .then(res => {
            const updatedProfile = res.data.data;
            
            dispatch(setUserProfile({
                user: updatedProfile,
                access_token: authStorage.getAccessToken() || '',
            }));

            messageApi.success('Update profile successfully');
            
            setChange(false);
        })
        .catch(err => {
            messageApi.error(err.response?.data?.message || 'Có lỗi xảy ra');
            console.log(err);
        });
    };

    const handleFormChange = () => {
        if (form.getFieldValue('firstname') === userProfile.firstname 
            && form.getFieldValue('lastname') === userProfile.lastname
            && form.getFieldValue('email') === userProfile.email
            && form.getFieldValue('phoneNumber') === userProfile.phoneNumber) {
                setChange(false);
                return;
        }

        setChange(true);
    }

    const resetForm = () => {
        form.resetFields();
        setChange(false);
    }

    return (
        <>
            <div className="!mx-auto !w-full lg:!w-profile !border text-center flex justify-around mb-2 rounded-lg overflow-hidden">
                <NavLink to='/user/profile' className={({ isActive }) => (isActive) ? 'bg-primary text-white font-semibold w-full p-3' : `w-full p-3 hover:text-primary transition-all duration-150`}>User Profile</NavLink>
                <NavLink to='/user/reset-password' className={({ isActive }) => (isActive) ? 'bg-primary text-white font-semibold w-full p-3' : `w-full p-3 hover:text-primary transition-all duration-150`}>Reset Password</NavLink>
            </div>
            {contextHolder}
            <Form
                form={form}
                name="user-profile"
                onChange={handleFormChange}
                className="!mx-auto !w-full !text-center lg:!w-profile !px-0 !border !border-transparent sm:!px-10 lg:!px-12 md:!px-32 2xl:!px-10 sm:!border-gray-200 !pt-9 !pb-4 !rounded-lg"
                layout="vertical"
                initialValues={userProfile}
                onFinish={onFinish}>
                <Flex justify="center">
                    <Form.Item className="!text-center !mb-5">
                        <ImgCrop rotationSlider modalTitle="Chỉnh sửa Avatar">
                            <Upload
                                name="avatar" 
                                customRequest={handleUploadFile}
                                showUploadList={false} 
                                onChange={handleChange}
                                disabled={isLoading} 
                                beforeUpload={beforeUpload}>
                                <div className="!flex !overflow-hidden !justify-center !items-center !rounded-full !w-32 !h-32 bg-gray-50 !border-2 !border-gray-200 !cursor-pointer border-dashed hover:!border-primary transition-all duration-150 ease">
                                    { isLoading 
                                        ? <LoadingOutlined style={{ fontSize: "4rem" }} className="text-primary" /> 
                                        : (imageUrl) 
                                            ? <img className="w-full rounded-full" alt="avatar" src={imageUrl} /> 
                                            : <CameraOutlined style={{ fontSize: "2.5rem" }} className="text-gray-500" /> 
                                    }
                                </div>
                            </Upload>
                        </ImgCrop>
                    </Form.Item>
                </Flex>

                <div className="!mb-8 !flex !flex-col !w-full !justify-center !items-center !gap-2">
                    <b className="!text-xl">{ userProfile?.username }</b>
                    <small className="!text-sm !text-gray-600">({userProfile?.role})</small>
                </div>

                <Flex gap={"1.2rem"} className="mb-4">
                    <Form.Item
                        className="!w-full !text-left"
                        name="lastname"
                        label="Lastname"
                        rules={[
                            {
                                required: true,
                                message: "Họ và tên không được bỏ trống",
                            },
                        ]}
                    >
                        <Input className="!p-2 !px-3" />
                    </Form.Item>

                    <Form.Item
                        className="!w-full !text-left"
                        name="firstname"
                        label="Firstname"
                        rules={[
                            {
                                required: true,
                                message: "Tên không được bỏ trống",
                            },
                        ]}
                    >
                        <Input className="!p-2 !px-3" />
                    </Form.Item>
                </Flex>
                <Flex gap={"1.2rem"}>
                    <Form.Item
                        className="!w-full !text-left"
                        name="email"
                        label="Email"
                        rules={[
                            { type: "email", message: "Email không hợp lệ" },
                            {
                                required: true,
                                message: "Email không được bỏ trống",
                            },
                        ]}
                    >
                        <Input className="!p-2 !px-3" />
                    </Form.Item>

                    <Form.Item
                        className="!w-full !text-left"
                        name="phoneNumber"
                        label="Phone number"
                        rules={[
                            {
                                pattern:
                                    /(03|05|07|08|09|01[2|6|8|9])+(\d{8})\b/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input className="!p-2 !px-3" />
                    </Form.Item>
                </Flex>
                <Form.Item className="!w-full !flex !justify-end !mt-4">
                    <Button
                        htmlType="button"
                        onClick={resetForm}
                        danger
                        type="primary"
                        className="mr-2 !text-sm !font-semibold !py-2 !px-4 !h-auto"
                        disabled={!change}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="!text-sm !font-semibold !py-2 !px-4 !h-auto"
                        disabled={!change}
                    >
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default Profile;

