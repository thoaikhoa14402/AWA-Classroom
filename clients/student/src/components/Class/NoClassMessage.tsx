import React from "react";
import { Button, message } from "antd";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "~/hooks/useAppDispatch";
import useJoinModal from "~/hooks/useJoinModal";
import axios from "axios";
import authStorage from "~/utils/auth.storage";
import { addClass } from "~/store/reducers/classSlice";

const NoClassMessage: React.FC = () => {

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    const { setOpenJoinModal, ModalContext } = useJoinModal({
        handleCreate: (values) => {
            return new Promise((resolve, reject) => {
                axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/join-with-code/`, {
                    code: values.code,
                }, {
                    headers: {
                        Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                    }
                })
                .then(res => {
                    messageApi.success('Joined class successfully!', 2, () => {
                        dispatch(addClass(res.data.data));
                        navigate(`/classes/feeds/${res.data.data.slug}`);
                    });

                    resolve(res.data);
                })
                .catch(err => {
                    console.log(err);
                    messageApi.error('Joined class failed!');
                    reject(err);
                });
            });
        },
        handleCancel: async () => {}
    });

    return (
        <>
            {contextHolder}
            {ModalContext}
            <div className="flex flex-col items-center justify-center h-full pb-28">
                <p className="font-semibold mb-6 text-2xl">
                    No Classes Available
                </p>
                <p className="text-gray-600 mb-8 text-center text-base">
                    It looks like you haven't created any classes yet.
                    <br />Let's join your first class!
                </p>
                <Button size="large" shape="round" className="!text-primary !border-primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => {
                    setOpenJoinModal(true);
                }} />
            </div>
        </>
    );
};

export default NoClassMessage;
