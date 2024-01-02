import React, { useMemo, useState } from 'react';
import { DragSortTable, ProColumns } from '@ant-design/pro-components';
import { Empty } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { ClassType } from '~/store/reducers/classSlice';

const GradeStructure: React.FC = () => {
    const [details] = useOutletContext<[ClassType]>();

    interface GradeStructure {
        key: string;
        name: string;
        scale: number;
        index: number;
    }
    
    const data: GradeStructure[] = useMemo(() => {
        if (details) {
            const gradeCompositions = details.gradeColumns.map((item, index) => {
                return {
                    key: `${item._id}`,
                    name: item.name,
                    scale: item.scale,
                    index,
                }
            });
            
            return gradeCompositions;
        }
        return [];
    }, [details]);
    
    const [dataSource, setDataSource] = useState<GradeStructure[]>(data);

    const [totalGradeScale, setTotalGradeScale] = useState(data.reduce((acc, item) => acc + item.scale, 0));

    const columns: ProColumns[] = useMemo(() => {

        const col: ProColumns[] = [
            {
                title: '',
                dataIndex: 'sort',
                width: 60,
                className: 'drag-visible',
                disable: true,
                align: 'center',
            },
            {
                title: 'Grade name',
                dataIndex: 'name',
                className: 'drag-visible !px-3.5',
            },
            {
                title: 'Grade scale (100%)',
                dataIndex: 'scale',
                className: 'drag-visible',
                render: (_, record) => {
                    return `${record.scale}%`;
                },
            },
        ];

        return col;
    }, []);

    const dragableContext = useMemo(() => {
        return (
            <DragSortTable
                columns={columns}
                rowKey="key"
                search={false}
                showHeader={true}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No grade composition" />
                }}
                showSorterTooltip={true}
                toolBarRender={false}
                pagination={false}
                dataSource={dataSource}
                dragSortKey="sort"
                className='mt-2'
            />
        );
    }, [columns, dataSource]);

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-medium mb-2'>Grades Structure</h1>
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
        </div>
    )
};

export default GradeStructure;