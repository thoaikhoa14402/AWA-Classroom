import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Popconfirm, Space, Table, InputRef, Typography, Tag, message, Flex} from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import axios from "axios";

interface DataType {
  _id: string;
  cid: string;
  name: string;
  numberOfStudents: number;
  owner: string;
  slug: string;
}

type DataIndex = keyof DataType;

const ClassroomTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/classroom/list`).then((response) => {
      if (response.status === 200) {
        setTimeout(() => { 
          setIsTableLoading(false);
          if (response.data.classrooms.length === 0) {
            message.info({
              content: 'No class found!',
              style: {
                fontFamily: 'Montserrat',
                fontSize: 16,
              },
              duration: 1.2,
            })
            return;
          }
          message.success({
            content: 'Data was loaded successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            },
            duration: 1.2,
          });
        setDataSource(response.data.classrooms);
        }, 800); 
       
      }
    }).catch((error: Response) => console.log('err:', error));

  }, [])

  // search item in column
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  // reset search text
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  // handle searching for columns
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            className = "!flex !justify-center !items-center !gap-0"
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            className= "!flex !justify-center !items-center"
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90}}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
           Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined className = {filtered ? "!text-primary" : ''}/>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Delete a row (new data item)
  const handleActionDelete = async (key: React.Key) => {
    setIsTableLoading(true);
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_HOST}/v1/classroom/${key}`);
      if (response.status === 200) {
        setTimeout(() => {
          setIsTableLoading(false);
          message.success({
            content: 'This course was deleted successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            }
          });
        setDataSource(response.data.updatedCourses);
        }, 1500);
      }
      else message.error({
        content: response.data.message,
      })
    } catch (err) {
      console.log('err: ', err);
      message.error({
        content: 'Unexpected errors!'
      })
    }
  };

  const columns: ColumnsType<DataType> = [
    {
        title: 'Course ID',
        dataIndex: 'cid',
        key: 'cid',
        ellipsis: true,
        ...getColumnSearchProps('cid'),
        onCell: (record) => ({
            record,
            editable: true,
            dataIndex: 'name',
            title: 'Course name',
          }),
        className: "!text-md",

    },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      ...getColumnSearchProps('name'),
      className: "!text-md",
    },
    {
        title: 'Students',
        dataIndex: 'numberOfStudents',
        width: '11%',
        key: 'numberOfStudents',
        className: "!text-md",
    },
    {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
        ...getColumnSearchProps('owner'),
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: '20%',
        render: (_, record) => (
              <Space size="middle" >
                <Button type = "primary" style = {{width: '75px'}}>View</Button>
                {dataSource.length >= 1 ? (
                  <Popconfirm title="Sure to delete?" onConfirm={() => handleActionDelete(record._id)}
                  >
                  <Button danger style = {{
                    width: '75px'
                  }} className = "!flex !justify-center !items-center">Delete</Button>
                  </Popconfirm>
              ) : null}
            </Space>
          )
    },
  ];

  return <div>
    <Typography.Title level={3} style={{ margin: 0, color: "#00A551" }} className='!uppercase !mt-4 !mb-4'>
       Classroom Management
    </Typography.Title>

    <Table 
      className = "myTable"
      bordered = {true}
      columns={columns} dataSource={dataSource} 
      loading = {isTableLoading}
      pagination={{
      total: dataSource.length,
      pageSize: 7,
      showSizeChanger: false, // Turn off feature to change page size
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    }}/>
  </div>
};

export default ClassroomTable;


// fake data
// const [dataSource, setDataSource] = useState<DataType[]>([
  //   {
  //       id: '1',
  //       username: '20127043',
  //       fullname: 'Brown Christan',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "nguyenthoaidangkhoa@gmail.com",
  //     },
  //     {
  //       id: '2',
  //       username: '20127044',
  //       fullname: 'Joe Black',
  //       phonenumber: '0903861717',
  //       active: false,
  //       email: "ntdkhoa14402@gmail.com",
    
  //     },
  //     {
  //       id: '3',
  //       username: '20127045',
  //       fullname: 'Jim Green',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "nguyenducminh@gmail.com",
  //     },
  //     {
  //       id: '4',
  //       username: '20127046',
  //       fullname: 'Jim Red',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "khangdinh017@gmail.com",
  //     },
  //     {
  //       id: '5',
  //       username: '20127047',
  //       fullname: 'Jim Lara',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "khoinguyen128@gmail.com",
  //     },
  //     {
  //       id: '6',
  //       username: '20127048',
  //       fullname: 'Jim High',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "minhtue167@gmail.com",
  //     },
  //     {
  //       id: '7',
  //       username: '20127049',
  //       fullname: 'Jim Low',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "ngoctram194@gmail.com",
  //     },
  //     {
  //       id: '8',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '9',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '10',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '11',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '12',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '13',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '14',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '15',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '16',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '17',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '18',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '19',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '20',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '21',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '22',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '23',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '24',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '25',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '26',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '27',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '28',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '29',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '30',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  //     {
  //       id: '30',
  //       username: '20127050',
  //       fullname: 'Jim Stuck',
  //       phonenumber: '0903861717',
  //       active: true,
  //       email: "vinhhuynh212@gmail.com",
  //     },
  // ]);