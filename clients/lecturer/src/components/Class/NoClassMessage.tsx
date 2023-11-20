import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useCreateClassModal from "~/hooks/useCreateClassModal";

const NoClassMessage: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = (values: any) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('create a class', values);
                navigate(`/classes/${values.class_name}`);
                resolve(1);
            }, 2000);
        });
    }

    const handleCancel = () => {
        console.log('cancel create a class');
    }

    const { setOpenCreateModal, ModalContext } = useCreateClassModal(
        {
            handleCreate,
            handleCancel,
        }
    );

    return (
        <>
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
