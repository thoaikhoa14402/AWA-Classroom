import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useCreateClassModal from "~/hooks/useCreateClassModal";
import useAppDispatch from "~/hooks/useAppDispatch";
import authStorage from "~/utils/auth.storage";
import axios from "axios";
import { addClass } from "~/store/reducers/classSlice";

const NoClassMessage: React.FC = () => {
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const [messageApi, contextHolder] = message.useMessage();

    const handleCreate = (values: any) => {
        return new Promise((resolve, reject) => {
            axios.post(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/`, values, {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                }
            })
            .then(res => {
                const classRes = res.data.data;
                console.log(classRes);
                
                messageApi.success('Class created successfully!', 1.5, () => {
                    dispatch(addClass(classRes));
                    navigate(`/classes/feeds/${classRes.slug}`);
                });
            })
            .catch(err => {
                console.log(err);
                messageApi.error('Class created failed!');
                reject(err);
            })
            .finally(() => {
                resolve(1);
            });
        });
    }

    const handleCancel = () => {
    }

    const { setOpenCreateModal, ModalContext } = useCreateClassModal(
        {
            handleCreate,
            handleCancel,
        }
    );

    return (
        <>
            { contextHolder }
            { ModalContext }
            <div className="flex flex-col items-center justify-center h-full pb-28">
                <p className="font-semibold mb-6 text-2xl">
                    No Classes Available
                </p>
                <p className="text-gray-600 mb-8 text-center text-base">
                    It looks like you haven't created any classes yet.
                    <br />Let's add your first class!
                </p>
                <Button size="large" shape="round" className="!text-primary !border-primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => setOpenCreateModal(true)} />
            </div>
        </>
    );
};

export default NoClassMessage;
