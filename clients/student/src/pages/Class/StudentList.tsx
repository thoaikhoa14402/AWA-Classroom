import React, { useEffect, useMemo, useState } from 'react';

import { Button, Empty, Input } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';

const StudentList: React.FC = () => {
    const [details] = useOutletContext<[ClassType]>();
    
    const [isSearch, setIsSearch] = useState(false);
    const [searchText, setSearchText] = useState('');

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

    const columns: ProColumns[] = useMemo(() => {

        const col: ProColumns[] = [
            {
                title: 'N.o',
                key: 'index',
                width: 70,
                align: 'center',
                render: (_, record, index) => record.no,
            }, 
            {
                title: 'Student ID',
                dataIndex: 'student_id',
                className: 'drag-visible !px-3.5',
                width: 170,
                render: (_, record) => (record.user) ? <NavLink to={`/user/${record.user}`} className='!text-primary !underline !underline-offset-2'>{record.student_id}</NavLink> : record.student_id,
            },
            {
                title: 'Full name',
                dataIndex: 'full_name',
                className: 'drag-visible',
                width: 370,
            },
            {
                title: 'Email',
                dataIndex: 'email',
                className: 'drag-visible',
            },
        ];

        return col;
    }, []);

    const dragableContext = useMemo(() => {
        return (
            <EditableProTable<StudentListStructure>
                columns={columns}
                rowKey="key"
                search={false}
                showHeader={true}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No students" />
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
                className='mt-2'
            />
        );
    }, [columns, dataSource]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isSearch) {
                setDataSource(data.filter((el) => {
                    return el.student_id.includes(searchText);
                }));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText, data, isSearch]);

    return (
        <div className='mt-2'>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-medium mb-2'>Student List</h1>
                <div className='flex gap-2'>
                    { 
                        data?.length
                        ? <Button title="search" className='!border-none !shadow-none' icon={<FontAwesomeIcon icon={faSearch} />} onClick={() => setIsSearch(prev => !prev)} /> 
                        : null
                    }
                </div>
            </div>
            <hr className='mb-2' />
            { data?.length ? <>
                { isSearch ? <div>
                    <Input 
                        type='search' 
                        autoFocus 
                        className='!p-2.5 !px-4 !border-t-transparent !border-l-transparent !border-r-transparent !rounded-none !mb-1 focus:!rounded-md' 
                        placeholder='Search by student ID'
                        onChange={(e) => setSearchText(e.target.value)} 
                    />
                </div> : null }
                { dragableContext }
            </> : null }
        </div>
    )
};

export default StudentList;