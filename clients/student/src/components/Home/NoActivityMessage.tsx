import React from "react";
import { Dropdown, MenuProps, message } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "~/hooks/useAppDispatch";
import useJoinModal from "~/hooks/useJoinModal";
import authStorage from "~/utils/auth.storage";
import { addClass } from "~/store/reducers/classSlice";
import axios from "axios";

const NoActivityMessage: React.FC = () => {

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

    const items: MenuProps["items"] = [
        {
            key: "join-class",
            label: 'Join a class',
            icon: <FontAwesomeIcon icon={faArrowRightToBracket} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => { setOpenJoinModal(true); }
        }
    ];

    return (
        <>
            {contextHolder}
            {ModalContext}
            <div className="flex flex-col items-center justify-center h-full pb-28">
                <p className="font-semibold mb-8 text-2xl">
                    No Activities Available
                </p>
                <p className="text-gray-600 mb-8 text-center text-base">
                    Start your journey by joining your first class!
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
