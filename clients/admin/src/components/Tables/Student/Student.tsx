import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Button, Input, Popconfirm, Space, Table, InputRef, Form, InputNumber } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';

interface DataType {
  id: string;
  username: string;
  fullname: string;
  phonenumber: string;
  active: string;
  email: string;
}

type DataIndex = keyof DataType;


// Editable cell
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: DataType;
    index: number;
    children: React.ReactNode;
  }
  
  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };


const StudentTable: React.FC = () => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
        id: '1',
        username: '20127043',
        fullname: 'Brown Christan',
        phonenumber: '0903861717',
        active: "true",
        email: "nguyenthoaidangkhoa@gmail.com",
      },
      {
        id: '2',
        username: '20127044',
        fullname: 'Joe Black',
        phonenumber: '0903861717',
        active: "false",
        email: "ntdkhoa14402@gmail.com",
    
      },
      {
        id: '3',
        username: '20127045',
        fullname: 'Jim Green',
        phonenumber: '0903861717',
        active: "true",
        email: "nguyenducminh@gmail.com",
      },
      {
        id: '4',
        username: '20127046',
        fullname: 'Jim Red',
        phonenumber: '0903861717',
        active: "true",
        email: "khangdinh017@gmail.com",
      },
      {
        id: '5',
        username: '20127047',
        fullname: 'Jim Lara',
        phonenumber: '0903861717',
        active: "true",
        email: "khoinguyen128@gmail.com",
      },
      {
        id: '6',
        username: '20127048',
        fullname: 'Jim High',
        phonenumber: '0903861717',
        active: "true",
        email: "minhtue167@gmail.com",
      },
      {
        id: '7',
        username: '20127049',
        fullname: 'Jim Low',
        phonenumber: '0903861717',
        active: "true",
        email: "ngoctram194@gmail.com",
      },
      {
        id: '8',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '9',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '10',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '11',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '12',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '13',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '14',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '15',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '16',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '17',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '18',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '19',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '20',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '21',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '22',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '23',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '24',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
        email: "vinhhuynh212@gmail.com",
      },
      {
        id: '25',
        username: '20127050',
        fullname: 'Jim Stuck',
        phonenumber: '0903861717',
        active: "true",
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
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            className = "!text-primary"
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
            className = "!text-primary"
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

  // Add a new row (new data item)
  const handleAddRow = () => {
    const newData: DataType = {
      id: '',
      username: '',
      fullname: '',
      phonenumber: '',
      active: "true",
      email: '',
    };
    setDataSource([newData, ...dataSource]);
  };

  // Handle save data in row
  const handleSave = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as DataType;

      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setDataSource(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
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
            handleSave: handleSave,
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
        width: "15%",
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
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
        width: '11%',
        ellipsis: true,
        ...getColumnSearchProps('active'),
        className: "!text-md",
        render: (_, record) => {
            return <span className = {`${record.active === "true" ? "!text-primary" : "!text-red-500"} !font-medium !text-center`}>
                {record.active}
            </span>
        }
      },
    {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: "20%",
        render: (_, record) => (
            // const editable = isEditing(record);
            <Space size="middle">
              <Button type="primary">Edit</Button>  
              {/* <Button danger>Delete</Button> */}
              {dataSource.length >= 1 ? (
                <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteRow(record.id)}>
                    <Button danger>Delete</Button>
                </Popconfirm>
        ) : null}
            </Space>
          )
    },
  ];

  return <div>
    <Button type="primary" style={{ marginBottom: 16 }} onClick = {handleAddRow}>Add new row</Button>
    <Table 
        columns={columns} dataSource={dataSource} 
        components={{
            body: {
              cell: EditableCell,
            },
          }}
        pagination={{
        total: dataSource.length,
        pageSize: 4,
        showSizeChanger: false, // Tắt chức năng thay đổi kích thước trang
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    }}/>
  </div>
};

export default StudentTable;
