import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Dropdown, Empty, Form, Input, MenuProps, Upload, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faCloudArrowUp, faDownload, faEdit, faEllipsisV, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useParams } from 'react-router-dom';
import axios from 'axios';
import authStorage from '~/utils/auth.storage';
import { ActionType, EditableProTable, ProColumns } from '@ant-design/pro-components';
import { UserType } from '~/store/reducers/userSlice';

const MappingTable: React.FC = () => {

    enum ClassPermissionType {
        READ = 'class_permission_read',
        WRITE = 'class_permission_write',
        NONE = 'class_permission_none'
    }
    
    interface IClassPermission {
        annoucement: ClassPermissionType;
        assignment: ClassPermissionType;
        review: ClassPermissionType;
        comment: ClassPermissionType;
    }
    
    interface IGradeColumn {
        _id: string;
        name: string;
        scale: number;
        published: boolean;
        order: number;
    };
    
    interface IStudentList {
        user?: string;
        _id: string;
        student_id: string;
        full_name: string;
        email: string;
    }
    
    interface IGradeList {
        user?: string;
        _id: string;
        student_id: string;
        grade_name: string[];
        grade: {
            col: string;
            value: number;
        }[];
    }
    
    interface ClassType {
        _id: string;
        cid: string;
        name: string;
        banner?: string;
        createAt: Date;
        students: Array<UserType & { studentID: string }>;
        lecturers: Array<UserType>;
        owner: UserType;
        inviteCode: string;
        slug: string;
        studentPermission: IClassPermission;
        lecturerPermission: IClassPermission;
        ownerPermission: IClassPermission;
        gradeColumns: Array<IGradeColumn>;
        studentList: Array<IStudentList>;
        gradeList: Array<IGradeList>;
    }

    const [details, setClassDetail] = useState<ClassType>();

    const { slug: classID } = useParams();

    const [triggerRender, toggleTriggerRender] = useState(false);
    
    useEffect(() => {
        if (classID) {
            axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/classes/${classID}`, {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
                }
            })
            .then(res => {
                setClassDetail(res.data.data);
            })
            .catch(err => {
                console.log(err);
            })
        } 
    }, [classID, triggerRender]);


    const [form] = Form.useForm();

    const actionRef = useRef<ActionType>();

    const [messageApi, holderContext] = message.useMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isUpload, setIsUpload] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [removedList, setRemovedList] = useState<React.Key[]>([]);
    const [addedList, setAddedList] = useState<React.Key[]>([]);

    interface StudentListStructure {
        key: string;
        student_id: string;
        full_name: string;
        email: string;
        user?: string;
    }
    
    const data: StudentListStructure[] = useMemo(() => {
        if (details) {
            const sortedList = details?.studentList?.sort((a, b) => (a.student_id < b.student_id) ? -1 : (a.student_id > b.student_id) ? 1 : 0);

            const studentList = sortedList?.map((item, index) => {
                return {
                    key: `${item._id}`,
                    student_id: item.student_id,
                    full_name: item.full_name,
                    email: item.email,
                    index,
                    user: item?.user,
                    no: index + 1,
                }
            });
            
            return studentList;
        }
        return [];
    }, [details]);

    const [dataSource, setDataSource] = useState<StudentListStructure[]>(data);

    useEffect(() => {
        setDataSource(data);
    }, [data]);

    const items: MenuProps["items"] = [
        {
            key: "export-student-list",
            label: 'Student list template',
            icon: <FontAwesomeIcon icon={faDownload} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => {
                axios.get("https://res.cloudinary.com/daa7j5ohx/raw/upload/v1/templates/gbpf1fmsw3fhcy4k9osi.xlsx", {
                    responseType: "blob",
                }).then(res => {
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    
                    link.href = url;
                    link.setAttribute('download', 'student-list-template.xlsx');
                    
                    link.click();
                }).catch(err => {
                    messageApi.error(err.message);
                });
            }
        },
        {
            key: "upload-student-list",
            label: 'Student list',
            icon: <FontAwesomeIcon icon={faCloudArrowUp} />,
            className: "!px-4 !py-2.5 !text-md !gap-1",
            onClick: () => setIsUpload(true),
        },
    ];

    const handleUploadFile = (options: any) => { 
        setIsLoading(true);

        const { onSuccess, onError, file, onProgress } = options;
        
        const formData = new FormData();
        formData.append("studentlist", file);
        
        axios.put(`${process.env.REACT_APP_BACKEND_HOST}/v1/student-list/${classID}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                'Authorization': authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : ''
            },
            onUploadProgress: (event: any) => onProgress({ percent: (event.loaded / event.total) * 100 })
        })
        .then((response: any) => {
            messageApi.success(`Student list upload successfully`, 1, () => {
                toggleTriggerRender(prev => !prev);
            });
            
            onSuccess(response.data.data);
        })
        .catch((error) => { 
            messageApi.error(`Upload failed`);
            onError({ error });
        })
        .finally(() => {
            setIsLoading(false);
        });
    };
    
    const handleRemove = (key: React.Key) => {
        setRemovedList(prev => [...prev, key]);
        setAddedList(prev => prev.filter(el => el !== key));
        setDataSource(prev => prev.filter((item) => item.key !== key));
    }

    const handleEdit = () => {
        form.validateFields()
        .then((formData: any) => {
            const updatedData: any[] = [...data, ...dataSource.filter(el => addedList.includes(el.key))].filter((el: any) => !removedList.includes(el.key));

            const sortedNewData = updatedData.map((data: any, index) => {
                const newData: any = (Object.values(formData)).find((el: any) => el.action.key === data.key);

                if (newData) {
                    updatedData[index].student_id = newData?.student_id;
                    updatedData[index].full_name = newData?.full_name;
                    updatedData[index].email = newData?.email;
                }

                return {
                    ...updatedData[index]
                }
            });

            setDataSource(sortedNewData);

            setIsLoading(true);
            axios.put(`${process.env.REACT_APP_BACKEND_HOST}/v1/student-list/${classID}`, 
            {
                studentList: sortedNewData,
            }, 
            {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : '',
                }
            })
            .then(res => {
                messageApi.success('Student list updated successfully', 1, () => {
                    toggleTriggerRender(prev => !prev);
                });
            })
            .catch(err => {
                messageApi.error('Failed to update student list');
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
            setIsEdit(false);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    const handleCancelEdit = () => {
        form.resetFields();
        setDataSource(data);
        setIsEdit(false);
        setAddedList([]);
        setRemovedList([]);
    }

    const columns: ProColumns[] = useMemo(() => {

        const extendsColumns: ProColumns = {
            title: '',
            dataIndex: '',
            width: 70,
            className: 'drag-visible',
            key: 'action',
            align: 'center',
            renderFormItem: (_, { record }) => <Button icon={<FontAwesomeIcon icon={faTrash} />} danger ghost onClick={() => handleRemove(record.key)} />,
        };

        const col: ProColumns[] = [
            {
                title: 'N.o',
                key: 'index',
                width: 70,
                align: 'center',
                render: (_, record, index) => record.no,
                renderFormItem: (_, {record}) => <span className='flexa items-center justify-center'><Input className='!invisible !w-0 !h-0 !p-0' />{record.no}</span>,
            }, 
            {
                title: 'Student ID',
                dataIndex: 'student_id',
                className: 'drag-visible !px-3.5',
                width: 170,
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            message: 'Student ID is required',
                        },
                        {
                            validator: (_, value, callback) => {
                                try {
                                    let count = 0;
                                    Object.values(form.getFieldsValue()).forEach((item: any) => {
                                        if (item.student_id === value) {
                                            count++;
                                            if (count > 1) {
                                                throw new Error('Student ID must be unique');
                                            }
                                        }
                                    });
                                    return Promise.resolve();
                                }
                                catch(err) {
                                    return Promise.reject(err);
                                }
                            }
                        }
                    ],
                },
                render: (_, record) => (record.user) ? <NavLink to={`/user/${record.user}`} className='!text-primary !underline !underline-offset-2'>{record.student_id}</NavLink> : record.student_id,
                renderFormItem: (_, { isEditable }) => isEditable ? <Input allowClear autoComplete='off' className='!p-2 !px-3.5' placeholder='Enter grade name' /> : null,
            },
            {
                title: 'Full name',
                dataIndex: 'full_name',
                className: 'drag-visible',
                width: 370,
                renderFormItem: (_, { isEditable }) => isEditable ? <Input allowClear autoComplete='off' className='!p-2 !px-3.5' placeholder='Enter fullname' /> : null,
            },
            {
                title: 'Email',
                dataIndex: 'email',
                className: 'drag-visible',
                renderFormItem: (_, { isEditable }) => isEditable ? <Input allowClear autoComplete='off' className='!p-2 !px-3.5' placeholder='0%' /> : null,
            },
        ];

        if (isEdit) {
            col.push(extendsColumns);
        }

        return col;
    }, [isEdit]);

    const dragableContext = useMemo(() => {
        const editableKeys = isEdit ? dataSource.map((item) => item.key) : [];

        return (
            <EditableProTable<StudentListStructure>
                actionRef={actionRef}
                columns={columns}
                rowKey="key"
                search={false}
                showHeader={true}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No students" />
                }}
                editable={{
                    form,
                    type: 'multiple',
                    editableKeys
                }}
                showSorterTooltip={true}
                toolBarRender={false}
                pagination={{
                    showSizeChanger: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    pageSize: 10,
                }}
                recordCreatorProps={false}
                value={dataSource}
                loading={isLoading}
                className='mt-2'
            />
        );
    }, [isEdit, columns, dataSource, form, isLoading]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isSearch) {
                setDataSource(data.filter((el) => {
                    return el.student_id.includes(searchText);
                }));
                setAddedList([]);
                setRemovedList([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText, data, isSearch]);

    return (
        <div className='mt-2'>
            {holderContext}
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-medium mb-2'>Mapping Student</h1>
                <div className='flex gap-2'>
                    { 
                        data?.length && !isUpload
                        ? <Button title="search" className='!border-none !shadow-none' icon={<FontAwesomeIcon icon={faSearch} />} onClick={() => setIsSearch(prev => !prev)} /> 
                        : null
                    }
                    { data?.length && !isUpload && isEdit 
                        ? 
                        <>
                            <Button title="cancel" icon={<FontAwesomeIcon size='lg' icon={faClose} />} danger onClick={handleCancelEdit} />
                            <Button title="finish" icon={<FontAwesomeIcon size='lg' icon={faCheck} />} type='primary' ghost onClick={handleEdit} />
                        </> 
                        : 
                        data?.length && !isUpload ? <Button title="edit" className='!border-none !shadow-none' icon={<FontAwesomeIcon size='lg' icon={faEdit} />} onClick={() => {
                            if (!isLoading) {
                                setIsEdit(true);
                            }
                        }} /> : null
                    }
                    { isUpload && data?.length ? <Button title="cancel" icon={<FontAwesomeIcon size='lg' icon={faClose} />} danger onClick={() => setIsUpload(false)} /> : null }
                    <div className='flex justify-end'>
                        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight" getPopupContainer={trigger => trigger.parentElement!} overlayClassName='!z-10'>
                            <Button className='!border-none !shadow-none' icon={<FontAwesomeIcon icon={faEllipsisV} size='lg' />} />
                        </Dropdown>
                    </div>
                    {/* <Button className='!text-sm !h-auto !w-auto !px-4 !py-3' icon={<FontAwesomeIcon icon={faDownload} />}>Export Template</Button> */}
                </div>
            </div>
            <hr className='mb-2' />
            { data?.length && !isUpload ? <>
                { isSearch ? <div>
                    <Input 
                        type='search' 
                        autoFocus 
                        className='!p-2.5 !px-4 !border-t-transparent !border-l-transparent !border-r-transparent !rounded-none !mb-1 focus:!rounded-md' 
                        placeholder='Search by student ID'
                        onChange={(e) => setSearchText(e.target.value)} 
                    />
                </div> : null }
                {dragableContext}
                { isEdit 
                    ? 
                    <Button 
                        className='!w-1/4 !block !mx-auto !mt-4 !p-2.5 !h-auto !border-dashed !font-medium' 
                        type='primary' 
                        ghost 
                        icon={<FontAwesomeIcon icon={faPlus} size='lg' />}
                        onClick={() => {
                            const newRow = {
                                key: `${dataSource.length + 1}`,
                                full_name: '',
                                email: '',
                                student_id: '',
                                no: dataSource.length + 1,
                                index: dataSource.length + 1,
                            }
                            setAddedList(prev => [...prev, newRow.key]);
                            setDataSource(prev => [...prev, newRow]);
                        }}
                    >
                        Add Composition
                    </Button> 
                    : null 
                }
            </> : null }
            { 
                !data?.length || isUpload ?
                    <Upload.Dragger disabled={isLoading} name="studentlist" customRequest={handleUploadFile}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'There are no student list found'} />
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint mb-8">Support for a single or bulk upload.</p>
                    </Upload.Dragger>
                :null
            }
        </div>
    )
};

export default MappingTable;