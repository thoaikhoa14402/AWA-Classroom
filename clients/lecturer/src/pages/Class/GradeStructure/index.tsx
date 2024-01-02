import React, { useMemo, useRef, useState } from 'react';
import { ActionType, DragSortTable, ProColumns } from '@ant-design/pro-components';

import { Button, Checkbox, Empty, Form, Input, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import authStorage from '~/utils/auth.storage';
import { ClassType, updateGradeComposition } from '~/store/reducers/classSlice';
import useAppDispatch from '~/hooks/useAppDispatch';

const GradeStructure: React.FC = () => {
    const timeout = useRef<any>(null);

    const [details] = useOutletContext<[ClassType]>();

    const { classID } = useParams();
    const [messageApi, holderContext] = message.useMessage();

    const [form] = Form.useForm();
    const [isEdit, setIsEdit] = useState(false);

    const actionRef = useRef<ActionType>();

    const dispatch = useAppDispatch();

    interface GradeStructure {
        key: string;
        name: string;
        scale: number;
        published: boolean;
        index: number;
    }
    
    const data: GradeStructure[] = useMemo(() => {
        if (details) {
            const gradeCompositions = details.gradeColumns.map((item, index) => {
                return {
                    key: `${item._id}`,
                    name: item.name,
                    scale: item.scale,
                    published: item.published,
                    index,
                }
            });
            
            return gradeCompositions;
        }
        return [];
    }, [details]);
    
    const [dataSource, setDataSource] = useState<GradeStructure[]>(data);
    const [isLoading, setIsLoading] = useState(false);

    const [totalGradeScale, setTotalGradeScale] = useState(data.reduce((acc, item) => acc + item.scale, 0));

    const columns: ProColumns[] = useMemo(() => {

        const handleChangePercent = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (timeout.current !== null) clearTimeout(timeout.current);

            const data = Object.values(form.getFieldsValue());
            const totalPercent = Number(data.reduce((acc, item: any) => Number(acc) + Number(item.scale), 0));

            timeout.current = setTimeout(() => {
                if (totalPercent > 100) {
                    messageApi.error('Total grade scale cannot be more than 100%');
                }

                setTotalGradeScale(totalPercent);
            }, 500);
        }

        const extendsColumns: ProColumns = {
            title: '',
            dataIndex: '',
            width: 20,
            className: 'drag-visible',
            key: 'action',
            align: 'center',
            renderFormItem: (_, { record }) => <Button icon={<FontAwesomeIcon icon={faTrash} />} danger ghost onClick={() => handleRemove(record.key)} />,
        };

        const col: ProColumns[] = [
            {
                title: '',
                dataIndex: 'sort',
                width: 60,
                className: 'drag-visible',
                disable: true,
                align: 'center',
                renderFormItem: () => {
                    return <Input className='hidden invisible !w-0 !h-0 !p-0 !m-0' tabIndex={-1} />
                },
            },
            {
                title: 'Grade name',
                dataIndex: 'name',
                className: 'drag-visible !px-3.5',
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            message: 'Grade name is required',
                        },
                        {
                            validator: (_, value, callback) => {
                                try {
                                    if (value === 'Total') {
                                        throw new Error('Grade name cannot be Total because it has been used to calculate the total grade');
                                    }

                                    let count = 0;
                                    Object.values(form.getFieldsValue()).forEach((item: any) => {
                                        if (item.name === value) {
                                            count++;
                                            if (count > 1) {
                                                throw new Error('Grade name must be unique');
                                            }
                                        }
                                    });

                                    if (value.length > 30) {
                                        throw new Error('Grade name must be less than 30 characters');
                                    }
                                    
                                    return Promise.resolve();
                                }
                                catch (err: any) {
                                    return Promise.reject(err);
                                }
                            }
                        }
                    ],
                },
                renderFormItem: (_, { isEditable }) => isEditable ? <Input allowClear autoComplete='off' className='!p-2 !px-3.5' placeholder='Enter grade name' /> : null,
            },
            {
                title: 'Grade scale (100%)',
                dataIndex: 'scale',
                className: 'drag-visible',
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            message: 'Grade scale is required',
                        },
                        {
                            pattern: /\d/,
                            message: 'Grade scale must be a number',
                        },
                    ],
                },
                render: (_, record) => {
                    return `${record.scale}%`;
                },
                renderFormItem: (_, { isEditable }) => isEditable ? <Input allowClear type='number' autoComplete='off' className='!p-2 !px-3.5' placeholder='0%' onChange={handleChangePercent} /> : null,
            },
            {
                title: 'Published',
                dataIndex: 'published',
                className: 'drag-visible',
                width: 50,
                align: 'center',
                formItemProps: {
                    valuePropName: 'checked'
                },
                render: (_, record) => <Checkbox checked={record.published} />,
                renderFormItem: (_, { record }) => <Checkbox defaultChecked={record.published} />,
            }
        ];

        if (isEdit) {
            col.push(extendsColumns);
        }

        return col;
    }, [isEdit]);


    const handleEdit = () => {
        const data = Object.values(form.getFieldsValue());
        const totalPercent = Number(data.reduce((acc, item: any) => Number(acc) + Number(item.scale), 0));

        if (totalPercent > 100) {
            messageApi.error('Total grade scale cannot be more than 100%');
            return;
        }

        form.validateFields()
        .then((formData: any) => {

            const updatedData = [...dataSource];
            
            const sortedNewData = updatedData.map((data, index) => {
                const newData: any = (Object.values(formData)).find((el: any) => el.action.key === data.key);
                updatedData[index].name = newData?.name;
                updatedData[index].scale = Number(newData?.scale);
                updatedData[index].published = newData?.published;

                return {
                    ...updatedData[index],
                    order: index,
                }
            });

            setDataSource(sortedNewData);

            setIsLoading(true);
            axios.put(`${process.env.REACT_APP_BACKEND_HOST}/v1/grade/composition/${classID}`, 
            {
                gradeCompositions: sortedNewData,
            }, 
            {
                headers: {
                    Authorization: authStorage.isLogin() ? `Bearer ${authStorage.getAccessToken()}` : '',
                }
            })
            .then(res => {
                messageApi.success('Grade structure updated successfully', 1, () => {
                    dispatch(updateGradeComposition({
                        classID: classID!,
                        gradeCompositions: res.data.data,
                    }));
                });
            })
            .catch(err => {
                messageApi.error('Failed to update grade structure');
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
        setTotalGradeScale(data.reduce((acc, item) => acc + item.scale, 0));
        setDataSource(data);
        setIsEdit(false);
    }

    const handleRemove = (key: React.Key) => {
        setDataSource(prev => prev.filter((item) => item.key !== key));
    }

    const dragableContext = useMemo(() => {
        const handleDragSortEnd = (
            beforeIndex: number,
            afterIndex: number,
            newDataSource: any,
        ) => {
            if (isEdit) 
                setDataSource(newDataSource);
            else 
                messageApi.warning('You must be in edit mode to change the order of the grade structure');
        };
    
        const editableKeys = isEdit ? dataSource.map((item) => item.key) : [];

        return (
            <DragSortTable
                actionRef={actionRef}
                columns={columns}
                rowKey="key"
                search={false}
                showHeader={true}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No grade composition" />
                }}
                editable={{
                    form,
                    type: 'multiple',
                    editableKeys
                }}
                showSorterTooltip={true}
                toolBarRender={false}
                pagination={false}
                dataSource={dataSource}
                dragSortKey="sort"
                onDragSortEnd={handleDragSortEnd}
                loading={isLoading}
                className='mt-2'
            />
        );
    }, [isEdit, columns, dataSource, form, isLoading, messageApi]);

    return (
        <div>
            {holderContext}
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-medium mb-2'>Grades Structure</h1>
                <div className='flex gap-2'>
                    { isEdit 
                        ? 
                        <>
                            <Button title="cancel" icon={<FontAwesomeIcon size='lg' icon={faClose} />} danger onClick={handleCancelEdit} />
                            <Button title="finish" icon={<FontAwesomeIcon size='lg' icon={faCheck} />} type='primary' ghost onClick={handleEdit} />
                        </> 
                        : <Button title="edit" className='!border-none !shadow-none' icon={<FontAwesomeIcon size='lg' icon={faEdit} />} onClick={() => {
                            if (!isLoading) {
                                setIsEdit(true);
                            }
                        }} />
                    }
                </div>
            </div>
            <hr />
            {dragableContext}
            <span className='font-medium block p-3 py-4 bg-gray-50 rounded-lg'>
                Total Grade Scale: &nbsp;
                <span className={
                    totalGradeScale > 100 
                    ? 'text-red-500 font-semibold' 
                    : totalGradeScale === 100 
                        ? 'text-green-600 font-semibold' : ''}>
                    {totalGradeScale}%
                </span>
            </span>
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
                            name: '',
                            scale: 0,
                            published: false,
                            index: dataSource.length,
                        }
                        setDataSource(prev => [...prev, newRow]);
                    }}
                >
                    Add Composition
                </Button> 
                : null 
            }
        </div>
    )
};

export default GradeStructure;