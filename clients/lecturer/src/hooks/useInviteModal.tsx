import { ReactElement, useState } from 'react';
import { faCheck, faClone, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AutoComplete, Avatar, Form, Modal, Space, Tag, Typography } from "antd";
import { useParams } from 'react-router-dom';

interface inviteModalProps {
    handleCreate: (...args: any[]) => void;
    handleCancel: () => void;
    code: string;
}

const useInviteModal = ({ handleCreate, handleCancel, code }: inviteModalProps) => {
    const [form] = Form.useForm();

    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [tags, setTags] = useState<string[]>([]);
    const [options, setOptions] = useState<{ value: ReactElement }[]>([]);

    const [role, setRole] = useState('student');

    const params = useParams();

    const handleCreateModal = () => {
        form.validateFields()
        .then(async (values: any) => { 
            setLoading(true);

            await handleCreate(values, tags, inviteLink, role);
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

        setOptions([]);
        setTags([]);
        setOpenInviteModal(false);
        form.resetFields();
    };

    const onSelect = (data: ReactElement) => {
        const email = data.props.children[1].props.children;

        setTags((prev) => [...prev, email]);

        console.log('onSelect', data);
        setOptions([]);
    };

    const onSearch = (searchText: string) => {
        if (!tags.find((el) => el === searchText) && /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(searchText))
            setOptions([{ value: <div className='!py-2 flex gap-3 items-center'>
                <Avatar src='https://lh3.googleusercontent.com/a/default-user=s50-p' />
                <span>{ searchText }</span>
            </div> }]);
        else if (options.length > 0) setOptions([]);
    }

    const inviteLink = `${ (role === 'lecturer') ? window.location.origin : process.env.REACT_APP_STUDENT_HOST }/classes/invite/${params.classID ?? ''}?code=${code}`

    const ModalContext = (
        openInviteModal 
        ? <Modal
            className="!text-center"
            title={<b className="font-semibold text-2xl ml-4 text-primary py-3 block"><FontAwesomeIcon icon={faUserPlus} size="lg" />&nbsp; Invite {role}</b>}
            centered
            open={openInviteModal}
            onOk={handleCreateModal}
            confirmLoading={loading}
            onCancel={handleCancelModal}
            closable={false}
            okText="Send"
            cancelButtonProps={{ disabled: loading, className: "!px-4 !py-2 !w-auto !h-auto !font-medium", type: "text" }}
            okButtonProps={{ className: "!px-4 !py-2 !w-auto !h-auto !font-medium !m-0", type: "text", disabled: tags.length === 0 }}
            maskClosable={!loading}>
            <Form autoComplete='off' form={form} layout="vertical" className="!mt-8 !px-1 !text-left flex flex-col gap-3">
                { 
                    role === 'student' 
                    ? <div className='flex flex-col py-5 gap-2 !p-0 my-4 mt-0'>
                        <span className='font-medium'>Invite link</span>
                        <Typography.Text 
                            className='!text-gray-500 !text-sm'
                            copyable={{
                                text: inviteLink,
                                tooltips: ['Copy', 'Copied!'],
                                icon: [<FontAwesomeIcon key={code} size='lg' icon={faClone} className='text-gray-500 hover:text-primary ml-1' />, <FontAwesomeIcon size='lg' key={`copied_${code}`} className='ml-1' icon={faCheck} color='lightgreen' />]
                            }} ellipsis>{inviteLink}</Typography.Text>
                    </div>
                    : null
                }

                { tags.length > 0 ?
                    <Form.Item name="checkedOptions" label="Emails" className='!m-0 !mb-3 !max-h-60 !overflow-auto'>
                        <Space size={[0, 8]} wrap>
                            { tags.map(email => (
                                <Tag key={email} closable onClose={() => setTags(prev => prev.filter(el => el !== email))} className='w-fit !px-1 !pr-3 !py-1 !flex !gap-2 !items-center !rounded-full'>
                                    <Avatar size={'small'} src='https://lh3.googleusercontent.com/a/default-user=s50-p' />
                                    <span className='text-xs'>{ email }</span>
                                </Tag>
                            )) }
                        </Space>
                    </Form.Item>
                    : null
                }

                <Form.Item className='border-b border-t !py-3 !h-auto'>
                    <AutoComplete
                        className="!border-none !ring-0 !outline-none"
                        options={options}
                        onSelect={onSelect}
                        onSearch={(text) => onSearch(text)}
                        bordered={false}
                        placeholder="Enter email" />
                </Form.Item>
            </Form>
        </Modal>
        : null
    );

    const setOpenInviteModalWithRole = (value: boolean, role: string) => {
        setOpenInviteModal(value);
        setRole(role);
    }

    return { openInviteModal, setOpenInviteModal: setOpenInviteModalWithRole, loading, setLoading, ModalContext };
}

export default useInviteModal;