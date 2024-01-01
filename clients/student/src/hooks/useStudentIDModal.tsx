import React, { useState } from 'react';
import { faIdCardClip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Input, Modal } from "antd";

interface studentIDModalProps {
    handleCreate: (...args: any[]) => void;
    handleCancel: () => void;
}

const useStudentIDModal = ({ handleCreate, handleCancel }: studentIDModalProps) => {
    const [form] = Form.useForm();

    const [openStudentIDModal, setOpenStudentIDModal] = useState(false);
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

        setOpenStudentIDModal(false);
        form.resetFields();
    };

    const ModalContext = (
        openStudentIDModal 
        ? <Modal
            className="!text-center"
            title={<b className="font-semibold text-2xl ml-4 text-primary py-3 block"><FontAwesomeIcon className='mr-2' icon={faIdCardClip} size='lg' />&nbsp;Student ID</b>}
            centered
            open={openStudentIDModal}
            onOk={handleCreateModal}
            confirmLoading={loading}
            onCancel={handleCancelModal}
            closable={false}
            okText="Update"
            cancelText="Later"
            cancelButtonProps={{ disabled: loading, className: "!px-4 !py-2 !w-auto !h-auto", type: "text" }}
            okButtonProps={{ className: "!px-4 !py-2 !w-auto !h-auto !m-0", type: "text" }}
            maskClosable={!loading}>
            <Form autoComplete='off' form={form} layout="vertical" className="!mt-8 !px-1 !text-left flex flex-col gap-3">
                <Form.Item
                    name="studentID"
                    label="Student ID"
                    rules={[
                        { required: true, message: 'Please input the student ID!' },
                    ]}
                    className="!m-0 !mb-4">
                    <Input 
                        className="!w-full !h-10 !px-4 !py-2 !rounded-lg !border !border-gray-300 !focus:outline-none !focus:ring-2 !focus:ring-primary !focus:border-transparent" 
                        placeholder='Enter student ID' />
                </Form.Item>
            </Form>
        </Modal>
        : null
    );

    return { openStudentIDModal, setOpenStudentIDModal, loading, setLoading, ModalContext };
}

export default useStudentIDModal;