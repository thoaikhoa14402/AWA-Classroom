import React, { useState } from 'react';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Input, Modal } from "antd";

interface joinModalProps {
    handleCreate: (...args: any[]) => void;
    handleCancel: () => void;
}

const useJoinModal = ({ handleCreate, handleCancel }: joinModalProps) => {
    const [form] = Form.useForm();

    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreateModal = () => {
        form.validateFields()
        .then(async (values: any) => { 
            setLoading(true);

            await handleCreate(values);
            handleCancelModal();
        })
        .catch((err: any) => {
            console.log(err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const handleCancelModal = async () => { 
        await handleCancel();

        setOpenJoinModal(false);
        form.resetFields();
    };

    const ModalContext = (
        openJoinModal 
        ? <Modal
            className="!text-center"
            title={<b className="font-semibold text-2xl ml-4 text-primary py-3 block"><FontAwesomeIcon icon={faUserPlus} size="lg" />&nbsp; Join class</b>}
            centered
            open={openJoinModal}
            onOk={handleCreateModal}
            confirmLoading={loading}
            onCancel={handleCancelModal}
            closable={false}
            okText="Join"
            cancelText="Cancel"
            cancelButtonProps={{ disabled: loading, className: "!px-4 !py-2 !w-auto !h-auto !font-medium !mr-2", type: "primary", danger: true }}
            okButtonProps={{ className: "!px-4 !py-2 !w-auto !h-auto !font-medium !m-0", type: "primary" }}
            maskClosable={!loading}>
            <Form autoComplete='off' form={form} layout="vertical" className="!mt-8 !px-1 !text-left flex flex-col gap-3">
                <Form.Item
                    name="code"
                    label="Class code"
                    rules={[
                        { required: true, message: 'Please input the class code!' },
                        { pattern: /[A-Z]{7}/, message: 'Class code not found!' }
                    ]}
                    className="!m-0 !mb-4">
                    <Input 
                        className="!w-full !h-10 !px-4 !py-2 !rounded-lg !border !border-gray-300 !focus:outline-none !focus:ring-2 !focus:ring-primary !focus:border-transparent" 
                        placeholder='Enter class code' />
                </Form.Item>
            </Form>
        </Modal>
        : null
    );

    return { openJoinModal, setOpenJoinModal, loading, setLoading, ModalContext };
}

export default useJoinModal;