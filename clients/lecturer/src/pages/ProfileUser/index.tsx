import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Flex,
} from "antd";
import axios from "axios";
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg'; 
import { UserType } from "~/store/reducers/userSlice";
import { NavLink, useParams } from "react-router-dom";
import authStorage from "~/utils/auth.storage";

const ProfileUser: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserType>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { id } = useParams();

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/user/${id}`, {
            headers: {
                Authorization: (authStorage.isLogin()) ? `Bearer ${authStorage.getAccessToken()}` : '',
            },
        }).then((res) => {
            setUserProfile(res.data.user);
            console.log(res.data.user);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    return !isLoading ? (
        <>
            <div className="!mx-auto !w-full lg:!w-profile !border text-center flex justify-around mb-2 rounded-lg overflow-hidden">
                <NavLink to='/user/profile' className={'bg-primary text-white font-semibold w-full p-3'}>User Profile</NavLink>
            </div>
            <Form
                name="user-profile"
                className="!mx-auto !w-full !text-center lg:!w-profile !px-0 !border !border-transparent sm:!px-10 lg:!px-12 md:!px-32 2xl:!px-10 sm:!border-gray-200 !pt-9 !pb-4 !rounded-lg"
                layout="vertical"
                initialValues={userProfile}>
                <Flex justify="center">
                    <Form.Item className="!text-center !mb-5">
                        <img style={{
                            width: 150,
                        }} className="w-full rounded-full overflow-hidden border" alt="avatar" src={userProfile?.avatar} />
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
                        <Input className="!p-2 !px-3" readOnly />
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
                        <Input className="!p-2 !px-3" readOnly />
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
                        <Input className="!p-2 !px-3" readOnly />
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
                        <Input className="!p-2 !px-3" readOnly />
                    </Form.Item>
                </Flex>
            </Form>
        </>
    ) : <LoadingIndicator />;
};

export default ProfileUser;

