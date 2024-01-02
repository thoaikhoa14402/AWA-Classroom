import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, MenuProps, message } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPlus } from "@fortawesome/free-solid-svg-icons";

import useCreateClassModal from "~/hooks/useCreateClassModal";
import axios from "axios";
import authStorage from "~/utils/auth.storage";
import useAppDispatch from "~/hooks/useAppDispatch";
import { addClass } from "~/store/reducers/classSlice";

const NoActivityMessage: React.FC = () => {

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

    const items: MenuProps["items"] = [
        {
            key: "create-class",
            label: 'Create a class',
            icon: <FontAwesomeIcon icon={faPlus} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => setOpenCreateModal(true)
        },
    ];

    return (
        <>
            { contextHolder }
            { ModalContext }
            <div className="flex flex-col items-center justify-center h-full pb-28">
                <p className="font-semibold mb-8 text-2xl">
                    No Activities Available
                </p>
                <p className="text-gray-600 mb-8 text-center text-base">
                    Start your journey by creating your first class!
                    <br />
                    Click <b className="text-primary">'Get Started'</b> to choose action which you want to begin
                    your education environment.
                </p>
                <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName="!z-0">
                    <button className="bg-primary p-3.5 text-white text-sm font-semibold flex items-center justify-center gap-3 px-4 rounded-md transition-all duration-200 hover:bg-hover">
                        <span>Get Started</span>
                        <FontAwesomeIcon icon={faAngleDown} />
                    </button>
                </Dropdown>
            </div>
        </>
    );
};

export default NoActivityMessage;

