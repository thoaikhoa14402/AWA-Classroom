import React, { useMemo, useState } from 'react';

import { Button, Empty } from 'antd';
import { NavLink, useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const StudentGradeList: React.FC = () => {
    const [details] = useOutletContext<[ClassType]>();

    const data: any[] = useMemo(() => {
        if (details) {
            const sortedList = details?.gradeList?.sort((a, b) => (a.student_id < b.student_id) ? -1 : (a.student_id > b.student_id) ? 1 : 0);
            const studentList = sortedList?.map((item: any, index) => {
                const dataValue: any = {
                    key: `${item._id}`,
                    index,
                    user: item?.user,
                    no: index + 1,
                    cols: details.gradeColumns.map((el: any) => el.name)
                };

                details.studentList.forEach((student: any) => {
                    if (student.student_id === item.student_id) {
                        dataValue.student_id = student.student_id;
                    }
                });

                if (dataValue.student_id) {
                    dataValue.total = details.gradeColumns.reduce((acc: number, el: any) => {
                        const grade = item.grade.find((grade: any) => grade.col === el.name);
                        const gradeScale = details.gradeColumns.find((grade: any) => grade.name === el.name)?.scale ?? 0;

                        return acc + (grade ? (grade.value ?? 0) * (gradeScale ?? 0) / 100 : 0);
                    }, 0);

                    item.grade.forEach((grade: any) => {
                        dataValue[grade.col] = grade.value;
                    });
                    
                    return dataValue;
                }
            });
            
            return studentList.length && studentList[0] ? studentList : [];
        }
        return [];
    }, [details]);

    const [dataSource, setDataSource] = useState<any[]>(data);

    const columns: ProColumns[] = useMemo(() => {

        const studentIdCol: ProColumns = {
            title: 'Student ID',
            dataIndex: 'student_id',
            className: 'drag-visible !px-3.5',
            width: 70,
            render: (_, record) => (record.user) ? <NavLink to={''} className='!text-primary !underline !underline-offset-2'>{record.student_id}</NavLink> : record.student_id,
        };

        const totalCol: ProColumns = {
            title: 'Total',
            dataIndex: 'total',
            className: 'drag-visible !px-3.5 !font-semibold !text-primary',
            align: 'center',
            width: 70,
            render: (_, record) => <span>{record.total}</span>,
        };

        const cols: ProColumns[] = data?.length && data[0] ? data[0].cols.map((el: any) => {
            return {
                title: el,
                dataIndex: el,
                className: 'drag-visible',
                width: 70,
                align: 'center',
                render: (_, record) => <span className={record[el] === 0 ? 'text-red-500 font-semibold' : ''}>{record[el] ?? '-'}</span>,
            } as ProColumns;
        }) : [];

        const col: ProColumns[] = cols ? [studentIdCol, ...cols, totalCol] : [];

        return col;
    }, [data]);

    const dragableContext = useMemo(() => {
        return (
            <EditableProTable<any>
                columns={columns}
                rowKey="key"
                search={false}
                showHeader={true}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No students" />
                }}
                showSorterTooltip={true}
                toolBarRender={false}
                recordCreatorProps={false}
                value={dataSource}
                className='mt-2'
            />
        );
    }, [columns, dataSource]);

    return (
        <div className='mt-2'>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-medium mb-2'>Student Grade List</h1>
                <Button className='!p-2 !px-5 !h-auto !font-medium !my-1' icon={<FontAwesomeIcon icon={faPlus} />} type='primary' ghost>Grade Review</Button> 
            </div>
            <hr className='mb-2' />
            { data?.length ? <>
                {dragableContext} 
            </> : null }
        </div>
    )
};

export default StudentGradeList;
