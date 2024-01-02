import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, MenuProps, message } from 'antd';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NoActivityMessage } from '~/components/Home';
import useAppDispatch from '~/hooks/useAppDispatch';
import useAppSelector from '~/hooks/useAppSelector';
import useCreateClassModal from '~/hooks/useCreateClassModal';
import { addClass } from '~/store/reducers/classSlice';
import authStorage from '~/utils/auth.storage';
import { ReactComponent as LoadingIndicator } from '~/assets/svg/loading-indicator.svg';
import ClassCard from '~/components/Class/ClassCard';

const HomePage: React.FC = () => {

    const classInfo = useAppSelector(state => state.classes);
    const classes = classInfo.classes;
    const isLoading = classInfo.isLoading;

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
            {
                !isLoading 
                ? classes.length 
                    ? 
                    <>
                        <div className='flex justify-end items-center h-13 px-3'>
                            <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                                <Button shape='circle' className='!w-10 !h-10'>
                                    <FontAwesomeIcon icon={faEllipsis} size='lg' />
                                </Button>
                            </Dropdown>
                        </div>
                        <h1 className='text-2xl font-medium mb-6 mt-0'>All Classes</h1>
                        <div className={`flex flex-wrap gap-10 xl:gap-4 xl:gap-y-4`}>
                            { classes.map((el, _) => (<ClassCard key={el._id} details={el} />)) }
                        </div>
                    </>
                    : <NoActivityMessage />
                : <div className='flex h-full w-full justify-center items-center pb-28'>
                    <LoadingIndicator />
                </div>  
            }  
        </>
    );
};

export default HomePage;