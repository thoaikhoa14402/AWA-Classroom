import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Popconfirm, Space, Table, InputRef, Typography, Tag, message} from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';

interface DataType {
  id: string;
  username: string;
  fullname: string;
  phonenumber: string;
  active: boolean;
  email: string;
}

type DataIndex = keyof DataType;

const StudentTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
        id: '1',
        username: '20127043',
        fullname: 'Brown Christan',
        phonenumber: '0903861717',
        active: true,
        email: "nguyenthoaidangkhoa@gmail.com",
      },
      {
        id: '2',
        username: '20127044',
        fullname: 'Joe Black',
        phonenumber: '0903861717',
        active: false,
        email: "ntdkhoa14402@gmail.com",
    
      },
      {
        id: '3',
        username: '20127045',
        fullname: 'Jim Green',
        phonenumber: '0903861717',
        active: true,
        email: "nguyenducminh@gmail.com",
      },
      {
        id: '4',
        username: '20127046',
        fullname: 'Jim Red',
        phonenumber: '0903861717',
        active: true,
        email: "khangdinh017@gmail.com",
      },
      {
        id: '5',
        username: '20127047',
        fullname: 'Jim Lara',
        phonenumber: '0903861717',
        active: true,
        email: "khoinguyen128@gmail.com",
      },
      {
        id: '6',
        username: '20127048',
        fullname: 'Jim High',
        phonenumber: '0903861717',
        active: true,
        email: "minhtue167@gmail.com",
      },
      {
        id: '7',
        username: '20127049',
        fullname: 'Jim Low',
        phonenumber: '0903861717',
        active: true,
        email: "ngoctram194@gmail.com",
      },
      {
        id: '8',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '9',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '10',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '11',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '12',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '13',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '14',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '15',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '16',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '17',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '18',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '19',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '20',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '21',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '22',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '23',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '24',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '25',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '26',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '27',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '28',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '29',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '30',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '30',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: true,
        email: "vinhhuynh212@gmail.com",
      },
  ]);

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
  const handleDeleteRow = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.id !== key);
    setDataSource(newData);
  };

  const columns: ColumnsType<DataType> = [
    {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
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
      width: "15%",
      ellipsis: true,
      ...getColumnSearchProps('fullname'),
      className: "!text-md",
    },
    {
        title: 'Phone',
        dataIndex: 'phonenumber',
        key: 'phonenumber',
        width: "14%",
        ...getColumnSearchProps('phonenumber'),
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
        width: '11%',
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
                <Tag color= {record.active ? "green" : "orange" } style = {{
                fontSize: 16,
                minWidth: 80,
                textAlign: 'center',
                padding: 4,
              }}>
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
                type="primary"
                style={{
                  width: '80px'
                }}
                className={record.active ? "!bg-orange-500 !hover:bg-orange-700 !border-transparent !text-white !flex !justify-center !items-center" : '!flex !justify-center !items-center'}
                onClick={() => {
                  setIsTableLoading(true);
                  setTimeout(() => {
                    const updatedDataSource = dataSource.map((item: DataType) => {
                      if (item.id === record.id) {
                        item.active = !item.active;
                      }
                      return item;
                    })
                    setDataSource(updatedDataSource);
                    setIsTableLoading(false);
                    message.success({
                      content: 'This account status was updated successfully!',
                      style: {
                        fontFamily: 'Montserrat',
                        fontSize: 16,
                      }
                    });
                  }, 1500);
                }}>         
                {record.active ? 'Lock' : 'Unlock'}
              </Button>
              {dataSource.length >= 1 ? (
                <Popconfirm title="Sure to delete?" onConfirm={() => {
                  setIsTableLoading(true);
                  setTimeout(() => {
                    handleDeleteRow(record.id)
                    setIsTableLoading(false);
                    message.success({
                      content: 'This account was deleted successfully!',
                      style: {
                        fontFamily: 'Montserrat',
                        fontSize: 16,
                      }
                    });
                  }, 1500);
                  }
                }
                >
                <Button danger style = {{
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
       Student Management
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

export default StudentTable;
