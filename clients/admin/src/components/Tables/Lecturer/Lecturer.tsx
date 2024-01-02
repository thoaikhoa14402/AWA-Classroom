import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Popconfirm, Space, Table, InputRef, Typography, Tag, message} from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import axios from "axios";

interface DataType {
  id: string;
  username: string;
  fullname: string;
  phoneNumber: string;
  active: boolean;
  email: string;
}

type DataIndex = keyof DataType;

const LecturerTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/lecturer/list`).then((response) => {
      if (response.status === 200) {
        setTimeout(() => { 
          setIsTableLoading(false);
          if (response.data.lecturers.length === 0) {
            message.info({
              content: 'No lecturers found!',
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
        setDataSource(response.data.lecturers);
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
    onFilter: (value, record) => {
      if (record[dataIndex]) {
        return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase())
      }
      return false;
    },
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
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_HOST}/v1/lecturer/${key}`);
      if (response.status === 200) {
        setTimeout(() => {
          setIsTableLoading(false);
          message.success({
            content: 'This account was deleted successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            }
          });
        setDataSource(response.data.updatedLecturers);
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

  // handle update lecturer's status
  const handleActionUpdateStatus = async (key: React.Key) => {
    setIsTableLoading(true);
    try {
      const response = await axios.patch(`${process.env.REACT_APP_BACKEND_HOST}/v1/lecturer/${key}`);
      if (response.status === 200) {
        setTimeout(() => {
          setIsTableLoading(false);
          message.success({
            content: 'This account status was updated successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            }
          });
        setDataSource(response.data.updatedLecturers);
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
  }

  const columns: ColumnsType<DataType> = [
    {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        ellipsis: true,
        ...getColumnSearchProps('username'),
        onCell: (record) => ({
            record,
            editable: true,
            dataIndex: 'username',
            title: 'Username',
          }),
        className: "!text-md",

    },
    {
      title: 'Full name',
      dataIndex: 'fullname',
      key: 'fullname',
      ellipsis: true,
      ...getColumnSearchProps('fullname'),
      className: "!text-md",
    },
    {
        title: 'Phone',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: "14%",
        ...getColumnSearchProps('phoneNumber'),
        className: "!text-md",
      },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      ellipsis: true,
      ...getColumnSearchProps('email'),
      className: "!text-md",
    },
    {
        title: 'Status',
        dataIndex: 'active',
        key: 'active',
        width: '12%',
        filters: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
        ],
        onFilter: (value: any, record) => {
          if (value === "active") return record.active === true;
          else if (value === "inactive") return record.active === false;
          return true;
        },
        // customize cell content
        render: (_, record) => {
          return (
              <Tag color= {record.active ? "green" : "default" } style = {{
              fontSize: 16,
              minWidth: 80,
              textAlign: 'center',
              padding: 4,
            }} className = {!record.active ? '!text-gray-400' : ''}>
              {record.active ? "Active" : "Inactive"}
            </Tag>
          );
      }
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: "21%",
        render: (_, record) => (
          <Space size="middle">
            <Button
              style={{
                width: '80px'
              }}
              type = "primary"
              // className={record.active ? "!bg-orange-500 !hover:bg-orange-700 !border-transparent !text-white !flex !justify-center !items-center" : '!flex !justify-center !items-center'}
              className={record.active ? "!bg-gray-400 !hover:bg-gray-700 !border-transparent !text-white !flex !justify-center !items-center !shadow" : '!flex !justify-center !items-center'}
              
              onClick={() => handleActionUpdateStatus(record.id)}>         
              {record.active ? 'Lock' : 'Unlock'}
            </Button>
            {dataSource.length >= 1 ? (
              <Popconfirm title="Sure to delete?" onConfirm={() => handleActionDelete(record.id)}
              >
              <Button type = 'primary' danger style = {{
                width: '80px'
              }} className = "!flex !justify-center !items-center">Delete</Button>
              </Popconfirm>
      ) : null}
          </Space>
      )
    },
  ];

  return <div>
    <Typography.Title level={3} style={{ margin: 0, color: "#00A551" }} className='!uppercase !mt-4 !mb-4'>
       Lecturer Management
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

export default LecturerTable;